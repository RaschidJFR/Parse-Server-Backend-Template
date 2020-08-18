// Declare environmental variables to load from .env file
type StringBoolean = '1' | '0' | '' | undefined;
declare namespace NodeJS {
  export interface ProcessEnv {
    CI?: StringBoolean,
    DB?: 'prod' | 'env';
    TESTING: StringBoolean;
    SKIP_SERVER_LAUNCH?: StringBoolean;
    NO_TIMEOUT?: StringBoolean;
    NODE_ENV?: 'development' | 'production';
    USE_CUSTOM_FILEADAPTER?: StringBoolean;
    VERBOSE?: StringBoolean;
  }
}
