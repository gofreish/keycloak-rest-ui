export interface Role{
    id: string,
    name: string,
    description: string,
    clientRole: boolean,
    composite: boolean,
    containerId: string
}

export const DefaultRole: Role = {
    id: "",
    name: "",
    description: "",
    clientRole: true,
    composite: false,
    containerId: ""
};