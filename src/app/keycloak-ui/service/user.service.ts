import { Injectable } from '@angular/core';
import { KEYCLOAK_CONFIG } from '../../keycloak-config';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { KeycloakUser } from '../model/user.model';
import { KeycloakService } from '../../service/keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

    private userUrl: string = `${KEYCLOAK_CONFIG.url}/admin/realms/${KEYCLOAK_CONFIG.realm}/users`;

    constructor(
        private httpClient: HttpClient,
        private keycloakService: KeycloakService
    ) { }

    createUser(user: KeycloakUser): Promise<any>{
        const newUser = {
            createdTimestamp: (new Date()).getTime(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            enabled: user.enabled,
            totp: false,
            emailVerified: false,
            disableableCredentialTypes: [],
            requiredActions: [],
            notBefore: 0,
            access: {},
            realmRoles: []
        };
        return firstValueFrom(
            this.httpClient.post<KeycloakUser[]>(this.userUrl, newUser)
        );
    }

    resetUserPassword(userId: string, password: string): Promise<any>{
        const data = {
            type:"password",
            value:password,
            temporary:false
        };
        return firstValueFrom(
            this.httpClient.put<KeycloakUser[]>(`${this.userUrl}/${userId}/reset-password`, data)
        );
    }

    updateUser(user: KeycloakUser): Promise<any>{
        const updateUser = {
            id: user.id,
            createdTimestamp: user.createdTimestamp,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            enabled: user.enabled,
            totp: false,
            emailVerified: user.emailVerified,
            disableableCredentialTypes: user.disableableCredentialTypes,
            requiredActions: user.requiredActions,
            notBefore: 0,
            access: user.access,
            //realmRoles: []
        };
        return firstValueFrom(
            this.httpClient.put<KeycloakUser[]>(`${this.userUrl}/${user.id}`, updateUser)
        );
    }

    getAllUsers(): Promise<KeycloakUser[]>{
        return firstValueFrom(
            this.httpClient.get<KeycloakUser[]>(this.userUrl)
        );
    }

    getUserById(id: string): Promise<KeycloakUser>{
        return firstValueFrom(
            this.httpClient.get<KeycloakUser>(`${this.userUrl}/${id}`)
        );
    }

    getUserGroupsById(id: string): Promise<any>{
        return firstValueFrom(
            this.httpClient.get<any>(`${this.userUrl}/${id}/groups`)
        );
    }

    /**
     * Logout the specified user
     * @param userId 
     * @returns 
     */
    logoutUser(userId: string){
        return firstValueFrom(
            this.httpClient.post<any>(`${this.userUrl}/${userId}/logout`, {})
        );
    }

    /**
     * Send reset password email
     * @param userId 
     * @returns 
     */
    resetPasswordEmail(userId: string){
        return firstValueFrom(
            this.httpClient.put<any>(`${this.userUrl}/${userId}/reset-password-email`, {})
        );
    }

    /**
     * Reset user password
     * @param userId 
     * @returns 
     */
    //TODO: Revoir le body de la requête
    resetPassword(userId: string){
        return firstValueFrom(
            this.httpClient.put<any>(`${this.userUrl}/${userId}/reset-password`, {})
        );
    }

    getUserRoleMapping(userId: string){
        return firstValueFrom(
            this.httpClient.get<any>(`${this.userUrl}/${userId}/role-mappings/clients/${this.keycloakService.clientUUID}`)
        );
    }
}
