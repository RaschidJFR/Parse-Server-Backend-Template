This folder contains the needed credentials for various services. Please note that content of this folder
may be included from the repository, so here's a list of the expected files and their formats:

```
//mailgun.js
export default {
  dev: {
    apiKey: ' ******',
    domain: '******.mailgun.org',
  },
  prod: {
    apiKey: ' ******',
    domain: '******.mailgun.org',
  }
}
```

```
//smpt.js
export default {
  dev: {
    service?: 'Gmail | Godaddy | Hotmail | Mailgun | Mandrill | Outlook365 | Yahoo',
    host?: string,
    port?: number,
    secure?: boolean,
    auth: {
      user: string,
      pass: string
    }
  },
  prod: {
    ...
    }
  }
}

```