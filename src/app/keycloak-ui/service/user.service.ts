import { Injectable } from '@angular/core';
import { KEYCLOAK_CONFIG } from '../keycloak-config';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, forkJoin, map, switchMap, tap } from 'rxjs';
import { KeycloakUser } from '../model/user.model';
import { KeycloakService } from './keycloak.service';

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

    updateUserObs(user: KeycloakUser): Observable<any>{
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
        return this.httpClient.put<KeycloakUser[]>(`${this.userUrl}/${user.id}`, updateUser);
    }
    
    updateUser(user: KeycloakUser): Promise<any>{
        return firstValueFrom(
            this.updateUserObs(user)
        );
    }

    updateUserAccountStatut(userId: string, accountStatus: boolean): Promise<any>{
        return firstValueFrom(
            this.getUserByIdObs(userId).pipe(
                switchMap(
                    user => {
                        user.enabled = accountStatus;
                        return this.updateUserObs(user);
                    }
                )
            )
        );
    }

    isUserActuallyConnectedObs(userId: string): Observable<boolean>{
        return this.httpClient.get<any[]>(`${this.userUrl}/${userId}/sessions`).pipe(
            map(
                sessions => {
                    return sessions.length>0;
                }
            )
        );
    }

    isUserActuallyConnected(userId: string): Promise<boolean>{
        return firstValueFrom(
            this.isUserActuallyConnectedObs(userId)
        );
    }

    /**
     * Retourne la lise des utilisateur avec le statut connecté ou pas
     * @returns KeycloakUser[]
     */
    getAllUsers(): Promise<KeycloakUser[]>{
        return firstValueFrom(
            this.httpClient.get<KeycloakUser[]>(this.userUrl).pipe(
                switchMap(
                    userList => {
                        const userWithConnectionStatusList: Observable<KeycloakUser>[] = userList.map(
                            user => this.isUserActuallyConnectedObs(user.id).pipe(
                                map(
                                    isConnected => {
                                        user.isConnected = isConnected;
                                        return user;
                                    }
                                )
                            )
                        );
                        return forkJoin(userWithConnectionStatusList);
                    }
                )
            )
        );
    }

    getUserByIdObs(id: string): Observable<KeycloakUser>{
        return this.httpClient.get<KeycloakUser>(`${this.userUrl}/${id}`);
    }
    getUserById(id: string): Promise<KeycloakUser>{
        return firstValueFrom(
            this.getUserByIdObs(id)
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
