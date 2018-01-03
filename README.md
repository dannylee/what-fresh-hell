# What Fresh Hell?

A project for the What Fresh Hell? Firebase function, powering the What Fresh Hell? Google Action.

## Installation

1. ``` $ git clone git@github.com:dannylee/what-fresh-hell.git ```
2. ``` $ cd what-fresh-hell ```
2. ``` $ npm install ```

## Deploying

Pre-requisites:

* firebase-tools

``` $ npm install -g firebase-tools ```
``` $ firebase login  ```
# Log in with the Google account in which you have created your Firebase project
``` $ firebase deploy --only functions ```