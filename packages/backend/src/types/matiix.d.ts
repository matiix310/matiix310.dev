declare module "matiix" {
  export type CanBeError<T> =
    | {
        error: true;
        message: string;
      }
    | {
        error: false;
        data: T;
      };
}
