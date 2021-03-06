# Welcome

Thank you in advance for being a part of this project and for helping to make HyperGrid the most performant and customizable grid
available! 

## Beginners

We have several beginner help wanted [tickets](https://github.com/openfin/fin-hypergrid/issues) open for community involvement.

## HyperGrid Core vs Add-ons

The core of Hypergrid is being improved to focus primarily as a fast data-view with customizable rendering. Data transformations (ie. sorting)
are left to the user and are excluded from the core of the grid. If you wish to provide a layer for data transformations
please do so as an [add-on](https://github.com/openfin/fin-hypergrid/tree/master/add-ons). 
Please note that eventually, these add-ons will be split out into their own set of repos.


## Getting Started

* Create a [GitHub account](https://github.com/signup/free)
* Fork the repository on GitHub

## Building & Interactive Development
```bash
$ git clone <your fork>
$ node -v # at least:
v4.0.0
$ npm -v # at least:
2.14.2
$ # We recommend using nvm to manage your versions of node and npm.
$ npm install -g gulp
$ npm install
$ gulp
``` 

## Making Changes

* Create a topic branch from where you want to base your work.
    * This is usually the `develop` branch.
    * Name your branch with a qualifier (IMPRV, DOCS, BUG, FEATURE, POC) followed by a forward slash and then some info about your branch.
        i.e. *IMPRV/Removed-unused-code*
    * Please avoid working directly on the `master` or `develop` branches.
* Make commits of logical units and squash your commits as needed to facilitate that
* Please *rebase* your work on top develop as needed so that your commits are seen as a fast-forward (and please fix any merge conflicts)
* Check for unnecessary whitespace with `git diff --check` before committing.
* For commit messages, please use full sentences and a brief explanation of what you accomplished.
    * The following example message is adopted from Puppet's labs sample commit.

````
    Make the example in CONTRIBUTING imperative and concrete

    Without this patch applied the example commit message in the CONTRIBUTING
    document is not a concrete example.  This is a problem because the
    contributor is left to imagine what the commit message should look like
    based on a description rather than an example.  This patch fixes the
    problem by making the example concrete and imperative.
````

* Make sure you have added the necessary [tests](https://github.com/openfin/fin-hypergrid/tree/master/test) for your changes.
* Run _all_ the tests to assure nothing else was accidentally broken.
* Test your changes in all IE10+, Safari, Chrome, Chrome 40, Firefox
* We are evaluating different testing strategies but for the moment, the major considerations are for
    * renders datacells when it is bound to homogenous data array
    * scrolls/arrow-key navigates cell-by-cell
    * uses less than 7% CPU when idle
    * can use html5 controls to edit the data already loaded
    * can draw customized renderers in cells performantly
    * resizes based on its viewport
    * can align fonts or unicode characters left, center or middle horizontally
    * the grid can pass the raw data it recieved through a customized data transformation pipeline
    * Columns can be resized
    ...


### Documentation

Code should be as self-explanatory as possible by using well-considered variable names; additional variables for intermediate values instead of unexplained subexpressions; clear, logical flow; parallel structure; etc. 
Use comments only to explain any remaining subtleties. 

On the other hand, we do believe in good usage of jsdocs _especially_ if your updating a public api call.
Here is an example of a [tutorial](http://openfin.github.io/fin-hypergrid/doc/tutorial-cell-editors.html)

## Submitting Changes

* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request to the repository in the openfin organization.
* Do not submit until ready to publish — and then hold off a bit longer until you feel certain you are not submitting prematurely. If you find you absolutely must update a pull request, you must leave an explanatory comment. Updating will delay merging your PR if we have to review it again. Please try to avoid doing this (by not submitting too early; see above).
* The core team looks at Pull Requests on a regular basis within a three-week sprint cycle.
* If your PR is accepted, congratulations!! 
    * We will label it as `Reviewed` add your submission notes to our release notes.

# Additional Resources

Feel free to open [issues](https://github.com/openfin/fin-hypergrid/issues) or email support@openfin.co
