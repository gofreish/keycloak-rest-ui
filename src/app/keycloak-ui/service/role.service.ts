import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KEYCLOAK_CONFIG } from '../../keycloak-config';
import { firstValueFrom } from 'rxjs';
import { KeycloakService } from '../../service/keycloak.service';
import { Role } from '../model/role.model';
import { KeycloakUser } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

    private clientUrl: string = `${KEYCLOAK_CONFIG.url}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients`;

    constructor(
        private httpClient: HttpClient,
        private keycloakService: KeycloakService
    ) {}

    getClientRoleByName(roleName: string): Promise<Role>{
        return firstValueFrom(
            this.httpClient.get<Role>(`${this.clientUrl}/${this.keycloakService.clientUUID}/roles/${roleName}`)
        );
    }

    getAllClientRoles(): Promise<Role[]>{
        return firstValueFrom(
            this.httpClient.get<Role[]>(`${this.clientUrl}/${this.keycloakService.clientUUID}/roles`)
        );
    }

    createClientRole(role: Role): Promise<Role>{
        const toSave = {
            name: role.name,
            description: role.description,
            clientRole: true,
            composite: false,
            containerId: this.keycloakService.clientUUID
        }
        return firstValueFrom(
            this.httpClient.post<Role>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/roles`,
                toSave
            )
        );
    }

    updateClientRole(roleName: string, updatedRole: Role): Promise<any>{
        const update = {
            id: updatedRole.id,
            name: updatedRole.name,
            description: updatedRole.description,
            clientRole: true,
            composite: false,
            containerId: this.keycloakService.clientUUID
        };
        return firstValueFrom(
            this.httpClient.put<any>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/roles/${roleName}`,
                update
            )
        );
    }

    deleteRole(role: Role): Promise<any>{
        return firstValueFrom(
            this.httpClient.delete<any>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/roles/${role.name}`
            )
        );
    }

    getUsersOfClientRole(roleName: string): Promise<KeycloakUser[]>{
        return firstValueFrom(
            this.httpClient.get<KeycloakUser[]>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/roles/${roleName}/users`
            )
        );
    }

    getGroupsOfClientRole(roleName: string): Promise<KeycloakUser>{
        return firstValueFrom(
            this.httpClient.get<KeycloakUser>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/roles/${roleName}/groups`
            )
        );
    }

    getClientPermissions(): Promise<any>{
        return firstValueFrom(
            this.httpClient.get<any>(
                `${this.clientUrl}/${this.keycloakService.clientUUID}/management/permissions`
            )
        );
    }

    addClientRoleToUser(userId: string, role: Role): Promise<any>{
        const roleToAdd = [
            {
                id: role.id,
                name: role.name,
                clientRole: true,
                composite: false,
                containerId: this.keycloakService.clientUUID
            }
        ];
        return firstValueFrom(
            this.httpClient.post<any>(
                `${KEYCLOAK_CONFIG.url}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${userId}/role-mappings/clients/${this.keycloakService.clientUUID}`,
                roleToAdd
            )
        );
    }

    removeClientRoleToUser(userId: string, role: Role): Promise<any>{
        const roleToRemove = [{
            id: role.id,
            name: role.name,
            clientRole: true,
            composite: false,
            containerId: this.keycloakService.clientUUID
        }];
        return firstValueFrom(
            this.httpClient.delete<any>(
                `${KEYCLOAK_CONFIG.url}/admin/realms/${KEYCLOAK_CONFIG.realm}/users/${userId}/role-mappings/clients/${this.keycloakService.clientUUID}`,{
                    body: roleToRemove
                }
            )
        );
    }

}
