import { Auth0Client } from "@auth0/nextjs-auth0/server";

type Auth0ServerModule = typeof import("@auth0/nextjs-auth0/server");
type Auth0ClientInstance = InstanceType<Auth0ServerModule["Auth0Client"]>;

let auth0Promise: Promise<Auth0ClientInstance> | null = null;

export async function getAuth0Client(): Promise<Auth0ClientInstance> {
    if (!auth0Promise) {
        auth0Promise = import("@auth0/nextjs-auth0/server").then(
            ({ Auth0Client }) => {
                return new Auth0Client({
                    signInReturnToPath: "/dashboard",
                });
            },
        );
    }

    return auth0Promise;
}

export const auth0 = new Auth0Client({
    signInReturnToPath: "/dashboard",
});
