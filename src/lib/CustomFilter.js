'use strict';

var FilterTree = require('filter-tree');
//var FilterTree = require('../../../../filter-tree/src');
var popMenu = require('pop-menu');
var _ = require('object-iterators');

var headerify = require('hyper-analytics').util.headerify;

var Parser = {
    CQL: require('./parser-cql'),
    SQL: require('./parser-sql')
};

/*
function ColumnQueryLanguage() {}

ColumnQueryLanguage.prototype.parse = function(columnName, state) {
    state =  {
        type: 'columnFilter',
        children: [ {
            column: columnName,
            operator: '>',
            literal: '2'
        }, {
            column: columnName,
            operator: '<',
            literal: '8'
        } ]
    };
    return state;
};

ColumnQueryLanguage.prototype.setOptions = function() {};
*/

/** @typedef {function} fieldsProviderFunc
 * @returns {menuOption[]} see jsdoc typedef in pop-menu.js
 */

/**
 * @constructor
 * @extends Operators
 */
var ConditionalsCql = FilterTree.Conditionals.extend({
    makeLIKE: function(beg, end, op, c) {
        var escaped = c.literal.replace(/([\[_%\]])/g, '[$1]'); // escape all LIKE reserved chars
        return op.toLowerCase() + ' ' + beg + escaped + end;
    },
    makeIN: function(op, c) {
        return op.toLowerCase() + ' ' + c.literal.replace(/\s*,\s*/g, ',');
    },
    make: function(op, c) {
        return op + (c.literal || c.identifier);
    }
});

var conditionals = new ConditionalsCql();

var FilterLeafPrototype = FilterTree.prototype.editors.Default.prototype;

// replace the default filter tree terminal node constructor with an extension of same
var CustomFilterLeaf = FilterTree.prototype.addEditor({
    getState: function getState(options) {
        var result,
            syntax = options && options.syntax;

        if (syntax === 'CQL') {
            result = this.getSyntax(conditionals);
            if (result[0] === '=') {
                result = result.substr(1);
            }
        } else {
            result = FilterLeafPrototype.getState.call(this, options);
        }

        return result;
    }
});

FilterTree.prototype.addEditor('Columns');

// Add some node templates by updating shared instance of FilterNode's templates. (OK to mutate shared instance; filter-tree not being used for anything else here. Alternatively, we could have instantiated a new Templates object for our CustomFilter prototype, although this would only affect tree nodes, not leaf nodes, but that would be ok in this case since the additions below are tree node templates.)
_(Object.getPrototypeOf(FilterTree.prototype).templates).extendOwn({
    columnFilter: function() {
/*
 <span class="filter-tree">
     <strong><span>{2} </span></strong><br>
     Match
     <label><input type="radio" class="filter-tree-op-choice" name="treeOp{1}" value="op-or">any</label>
     <label><input type="radio" class="filter-tree-op-choice" name="treeOp{1}" value="op-and">all</label>
     <label><input type="radio" class="filter-tree-op-choice" name="treeOp{1}" value="op-nor">none</label>
     of the following:
     <select>
        <option value="">New expression&hellip;</option>
     </select>
     <ol></ol>
 </span>
*/
    },
    columnFilters: function() {
/*
<span class="filter-tree filter-tree-type-column-filters">
    Match <strong>all</strong> of the following column filter subexpressions:
    <ol></ol>
</span>
*/
    }
});

/** @constructor
 *
 * @desc This extension of FilterTree forces a specific tree structure.
 * See {@link makeNewRoot} for a description.
 *
 * @param {FilterTreeOptionsObject} options - You must provide column schema, either for the whole filter tree through `options.schema` or `options.state.schema` or for the specific nodes that need to render column list drop-downs.
 *
 * > NOTE: If `options.state` is undefined, it is defined here as a new {@link makeNewRoot|empty state scaffold) to hold new table filter and column filter expressions to be added through UI.
 */
var CustomFilter = FilterTree.extend('CustomFilter', {
    preInitialize: function(options) {
        if (options) {

            // Set up the default "Hyperfilter" profile (see function comments)
            options.state = options.state || this.makeNewRoot();

            // Upon creation of a 'columnFilter' node, force the schema to the one column
            if ((options.type || options.state && options.state.type) === 'columnFilter') {
                this.schema = [
                    popMenu.findItem(options.parent.root.schema, options.state.children[0].column)
                ];
            }

            if (options.headerify) {
                var schema = this.schema || options.schema || options.state && options.state.schema;
                if (schema) {
                    popMenu.walk(schema, function(item) {
                        if (!item.alias) {
                            item.alias = headerify(item.name);
                            return item; // replace it
                        }
                    });
                }
            }
        }
    },

    initialize: function(options) {
        this.cache = {};

        if (!options.parent) {
            this.extractSubtrees();
        }
    },

    /**
     * Create convenience vars to reference the 2 root "Hyperfilter" nodes
     * @memberOf CustomFilter.prototype
     */
    extractSubtrees: function() {
        var rootNodes = this.root.children;
        this.tableFilter = rootNodes[0];
        this.columnFilters = rootNodes[1];
    },

    /**
     * @summary Make a new empty Hypergrid filter tree state object.
     * @desc This function makes a new default state object as used by Hypergrid, a root with exactly two persisted child nodes:
     *
     * * children[0] represents the _table filter,_ a series of any number of filter expressions and/or subexpressions
     * * children[1] represents the _column filters,_ a series of subexpressions, one per active column filter
     *
     * The `operator` properties for all subexpressions default to `'op-and'`, which means:
     * * AND all table filter expressions and subexpressions together (may be changed from UI)
     * * AND all column Filters subexpressions together (cannot be changed from UI)
     * * AND table filters and column filters together (cannot be changed from UI)
     *
     * @returns a new instance of a Hyperfilter root
     * @memberOf CustomFilter.prototype
     */
    makeNewRoot: function() {

        this.tableFilter = {
            persist: true,
            children: [
                // table filter expressions and subexpressions go here
            ]
        };

        this.columnFilters = {
            persist: true,
            type: 'columnFilters',
            children: [
                // subexpressions with type 'columnFilter' go here, one for each active column filter
            ]
        };

        var filter = {
            children: [
                this.tableFilter,
                this.columnFilters
            ]
        };

        return filter;
    },

    getColumnFilter: function(columnName) {
        return this.columnFilters.children.find(function(columnFilter) {
            return columnFilter.children.length && columnFilter.children[0].column === columnName;
        });
    },

    /** @typedef {object} filterTreeGetStateOptionsObject
     * See filter-tree's {@link http://joneit.github.io/filter-tree/FilterTree.html#getState|getState} options object.
     */

    /** @typedef {object} filterTreeSetStateOptionsObject
     * See filter-tree's {@link http://joneit.github.io/filter-tree/FilterNode.html#setState|setState} options object.
     */

    /**
     *
     * @param columnName
     * @param {filterTreeGetStateOptionsObject} [options]
     * @param {boolean} [options.syntax='CQL']
     * @memberOf CustomFilter.prototype
     */
    getColumnFilterState: function(columnName, options) {
        var result,
            subexpression = this.getColumnFilter(columnName);

        if (subexpression) {
            var syntax = options && options.syntax || 'CQL';
            result = subexpression.getState({ syntax: syntax });
        } else {
            result = '';
        }

        return result;
    },

    /**
     *
     * @param columnName
     * @param state
     * @param {filterTreeSetStateOptionsObject} [options]
     * @param {boolean} [options.syntax='CQL']
     * @memberOf CustomFilter.prototype
     */
    setColumnFilterState: function(columnName, query, options) {
        var error,
            language = options && options.syntax || 'CQL',
            subexpression = this.getColumnFilter(columnName);

        // on first use, set up a new CQL instance for this column filter's subtree bound to column properties
        var parser = this[language] = this[language] ||
            new Parser[language](this.root.schema, resolveProperty.bind(this, columnName));

        // convert some CQL state syntax into a filter tree state object
        try {
            var state = parser.parse(query, { columnName: columnName });
        } catch (e) {
            error = e.message || e;
            console.warn(error);
        }

        if (state) { // parse successful
            if (subexpression) { // subexpression already exists
                // replace subexpression representing this column
                subexpression.setState(state);
            } else {
                // add a new subexpression representing this column
                subexpression = this.columnFilters.add(state);
            }

            error = subexpression.invalid(options);
        } else if (!query && subexpression) {
            // remove subexpression representing this column
            subexpression.remove();
        }

        return error;
    },

    /**
     * @desc The CQL syntax should only be requested for a subtree containing homogeneous column names and no subexpressions.
     *
     * @param {string} [options.syntax='CQL'] - If omitted or `'CQL'`, walks the tree, returning a string suitable for a Hypergrid filter cell. All other values are forwarded to the prototype's `getState` method for further interpretation.
     *
     * @returns {FilterTreeStateObject}
     */
    getState: function getState(options) {
        var result,
            syntax = options && options.syntax;

        if (syntax === undefined || syntax === 'CQL') {
            var operator = this.operator.substr(3); // remove the 'op-' prefix
            result = '';
            this.children.forEach(function(child, idx) {
                if (child) {
                    if (child instanceof CustomFilterLeaf) {
                        if (idx) {
                            result += ' ' + operator + ' ';
                        }
                        result += child.getState(options);
                    } else if (child.children.length) {
                        throw new Error('CustomFilter: Expected a conditional but found a subexpression. Subexpressions are not supported in CQL ("column query language," the filter cell syntax).');
                    }
                }
            });
        } else {
            result = this.super.getState.call(this, options);
        }

        return result;
    },

    // All remaining methods are co-routines called from grid.curtain
    // See cellEditors/Filter.js

    onInitialize: function() {

    },

    onShow: function(container) {

    },

    onOk: function() {
        return this.invalid({ alert: true, focus: true });
    },

    onHide: function(container) {

    },

    create: function() {
        return this.test.bind(this);
    }
});

function resolveProperty(columnName, propertyName) {
    //todo: finish this
    //return column.resolveProperty('filterCql' + key[0].toUpperCase() + key.substr(1));
}

module.exports = CustomFilter;