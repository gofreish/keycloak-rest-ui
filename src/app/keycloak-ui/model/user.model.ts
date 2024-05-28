export interface KeycloakUser{
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    enabled: boolean,
    isConnected?: boolean,
    createdTimestamp?: string,
    access?: any,
    disableableCredentialTypes?: any
    requiredActions?: any,
    federatedIdentities?: any,
    emailVerified?: boolean
}

export const DefaultKeycloakUser: KeycloakUser = {
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    enabled: true,
    isConnected: false
}