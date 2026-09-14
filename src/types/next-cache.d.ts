import "next/cache";

declare module "next/cache" {
  export function revalidateTag(tag: string): undefined;
}
