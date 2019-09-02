Build css files by running `$ npm run scss`. They will be output to `css` folder. Then you can use them in your email templates by specifying it in the module configuration:

```ts
// main.ts
Mail.init({
  ...
  templatePath: `${ENV.assetsPath}/templates`,
  defaultCss: `css/mailing.css`
});
```