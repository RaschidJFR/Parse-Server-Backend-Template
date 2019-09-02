This folder is meant to contain the needed credentials for various services. Please note that the content of this folder
may be excluded from the repository, so here's a list of the possibly expected files and their formats:

```ts
//mailgun.ts
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

```ts
//smpt.ts
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

```ts
//stripe.ts
export default {
  dev: {
    publicKey: '**********',
    secretKey: '**********'
  },
  prod: {
    publicKey: '**********',
    secretKey: '**********'
  }
}
```