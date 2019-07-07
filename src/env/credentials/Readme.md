This folder contains the needed credentials for various services. Please note that content of this folder
may be included from the repository, so here's a list of the expected files and their formats:

```
//mailgun.js
export default {
  dev: {
    apiKey: ' ******',
    domain: '******.mailgun.org',
    from: `Name<no-reply@*****.mailgun.org>`
  },
  prod: {
    apiKey: ' ******',
    domain: '******.mailgun.org',
    from: `Name<no-reply@*****.mailgun.org>`
  }
}
```