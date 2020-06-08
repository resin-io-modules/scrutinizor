# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## v1.1.0 - 2018-01-17

## 1.33.0 - 2020-06-08

* Fallback to markdown changelog if yml changelog is not present [Lucian Buzzo]

## 1.32.0 - 2020-05-18

* List contributions count of contributors [Amit Solanki]

## 1.31.0 - 2020-04-14

* Use OCR to detect text in logo [Lucian Buzzo]

## 1.30.0 - 2020-04-14

* Add plugin filter to local and remote calls [Giovanni Garufi]

## 1.29.2 - 2020-04-11

* Add support for retrieving screenshots inside docker containers [Lucian Buzzo]

## 1.29.1 - 2020-04-06

* Don't try to log headers if they don't exist [Lucian Buzzo]

## 1.29.0 - 2019-11-15

* Group downloads by arch & os [Dimitrios Lytras]

## 1.28.1 - 2019-11-15

* Fix 'hightlights' parsing [Dimitrios Lytras]

## 1.28.0 - 2019-11-14

* screenshot: Allow GIFs [Dimitrios Lytras]

## 1.27.4 - 2019-11-04

* Add specific chromium path when running on alpine [Giovanni Garufi]

## 1.27.3 - 2019-10-25

* Fix Highlights parsing [Dimitrios Lytras]

## 1.27.2 - 2019-10-25

* fix: Parse the last FAQ item [Dimitrios Lytras]

## 1.27.1 - 2019-10-25

* Use base64 for screenshot [Dimitrios Lytras]

## 1.27.0 - 2019-10-25

* Fetch screenshot from repo [Dimitrios Lytras]

## 1.26.3 - 2019-10-24

* faq: Collect whole content of the entry [Dimitrios Lytras]

## 1.26.2 - 2019-10-23

* Fix logo parsing [Dimitrios Lytras]

## 1.26.1 - 2019-10-21

* example: Fix plugin metadata [Dimitrios Lytras]

## 1.26.0 - 2019-10-21

* readme: Parse Examples section [Dimitrios Lytras]

## 1.25.0 - 2019-10-21

* readme: Parse highlights [Dimitrios Lytras]

## 1.24.0 - 2019-10-21

* readme: Parse Introduction setion [Dimitrios Lytras]

## 1.23.1 - 2019-10-21

* readme: Get the full section contents [Dimitrios Lytras]

## 1.23.0 - 2019-10-21

* plugins: Parse 'Hardware/Software required' sections from readme [Dimitrios Lytras]

## 1.22.0 - 2019-10-08

* plugin: Get logo [Dimitrios Lytras]

## 1.21.2 - 2019-10-08

* Fix version parsing for non NPM projects [Dimitrios Lytras]

## 1.21.1 - 2019-10-03

* Improve directory scanning in local mode [Dimitrios Lytras]

## 1.21.0 - 2019-10-02

* plugin: Fetch version [Dimitrios Lytras]

## 1.20.1 - 2019-09-20

* contributors: Exclude balena-ci [Dimitrios Lytras]

## 1.20.0 - 2019-09-20

* plugin: Get # of open issues [Dimitrios Lytras]

## 1.19.0 - 2019-09-19

* Include filenames in doc & blog files [Dimitrios Lytras]

## 1.18.1 - 2019-09-19

* docs: Temporarily ignore subdirectories [Dimitrios Lytras]

## 1.18.0 - 2019-09-18

* Publish own scrutinizer data [Dimitrios Lytras]

## 1.17.0 - 2019-09-17

* Add Blog & Docs plugin [Dimitrios Lytras]

## 1.16.3 - 2019-09-17

* Update CODEOWNER & Docs tests [Dimitrios Lytras]

## 1.16.2 - 2019-09-17

* Bring e2e tests up to date [Dimitrios Lytras]

## 1.16.1 - 2019-09-13

* Fix: Use consistent camelCase for metadata [Dimitrios Lytras]

## 1.16.0 - 2019-09-12

* Gh-metadata: Expose Homepage, Repo URL, Active [Dimitrios Lytras]

## 1.15.0 - 2019-09-12

* Plugin: Parse SECURITY.md [Dimitrios Lytras]

## 1.14.0 - 2019-09-10

* Plugin: Fetch changelog [Dimitrios Lytras]

## 1.13.0 - 2019-09-10

* Readme-plugin: Add motivation && installationSteps parsers [Dimitrios Lytras]

## 1.12.0 - 2019-09-10

* Github-meta: Expose Owner & Stars amount [Dimitrios Lytras]

## 1.11.1 - 2019-09-10

* Config: Relax some es-lint rules [Dimitrios Lytras]

## 1.11.0 - 2019-09-06

* Plugin: Add CoC [Dimitrios Lytras]

## 1.10.0 - 2019-05-21

* Plugins: Get name & description [Dimitrios Lytras]

## 1.9.0 - 2019-05-20

* Plugin: Get Readme [Dimitrios Lytras]

## 1.8.1 - 2019-04-26

* Check if candidate is null when fetching prerelease [Giovanni Garufi]

## 1.8.0 - 2019-04-23

* Plugins: Add isFork plugin [Dimitrios Lytras]

## 1.7.0 - 2019-03-27

* Add getPreRelease plugin [Giovanni Garufi]
* Plugin: Introduce getLatestRelease [Dimitrios Lytras]

## 1.6.0 - 2019-03-26

* Cli: Add a CLI interface [John (Jack) Brown]
* Test: Use a dedicated repo for the test cases [Dimitrios Lytras]

## 1.5.0 - 2019-03-25

* Drop momentjs [Dimitrios Lytras]

## 1.4.0 - 2019-03-19

* Test: Use a dedicated repo for the test cases [Dimitrios Lytras]

## 1.3.2 - 2019-03-15

* Plugins/license: Stop throwing error if package.json is missing [John (Jack) Brown]

## 1.3.1 - 2019-03-14

* Maintenance: Remove leftover travis yaml file [Dimitrios Lytras]

## 1.3.0 - 2019-03-13

* Plugin: Introduce getLastCommitDate [Dimitrios Lytras]

## 1.2.0 - 2019-03-12

* Dependencies: Upgrade @octokit/rest [Dimitrios Lytras]

- Extract NPM dependencies from `package.json`

## v1.0.0 - 2018-01-17

- Read license information from `package.json`
- Try to find contributing guidelines in `docs/CONTRIBUTING.md`
- Try to find architecture docs in `ARCHITECTURE.md` or `docs/ARCHITECTURE.md`
- Check if a repository is in GitHub, and if so, whether is public or private
- Check configured integrations on a GitHub repository
