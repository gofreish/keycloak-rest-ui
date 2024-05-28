import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { UserService } from '../../service/user.service';
import { ActivatedRoute } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DefaultKeycloakUser, KeycloakUser } from '../../model/user.model';
import { Location } from '@angular/common';
import { Role, DefaultRole } from '../../model/role.model';
import { ChipModule } from 'primeng/chip';
import { DropdownModule } from 'primeng/dropdown';
import { RoleService } from '../../service/role.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { KeycloakLoadingComponent } from '../../shared/keycloak-loading.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    AccordionModule,
    InputGroupModule,
    InputGroupAddonModule,
    ChipModule,
    DropdownModule,
    KeycloakLoadingComponent,
    FormsModule,
    ButtonModule,
    CardModule
  ],
  providers: [MessageService],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit{

    user: WritableSignal<KeycloakUser> = signal({...DefaultKeycloakUser});
    userRoles: WritableSignal<Role[]> = signal([]);
    clientRolesList: WritableSignal<Role[]> = signal([]);
    selectedRole: Role|undefined = undefined;
    isLoading: WritableSignal<boolean> = signal(false);

    constructor(
        private userService: UserService,
        private roleService: RoleService,
        private activatedRoute: ActivatedRoute,
        private location: Location,
        private messageService: MessageService
    ){}

    ngOnInit(): void {
        const userId = this.activatedRoute.snapshot.paramMap.get("id");
        if(!userId){
            this.location.back();
            return;
        }
        this.userService.isUserActuallyConnected(userId)
        .then(resp => console.log(resp))
        .catch(err => console.log(err));
        this.isLoading.update(value => !value);
        this.initData(userId)
        .then(
            
        )
        .catch(
            err => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups, un problème de connexion, veuillez recharger" })
        )
        .finally(
            () => this.isLoading.update(value => !value)
        );
    }

    async addRoleToClient(){
        if(this.selectedRole == undefined){
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Choisissez un rôle" })
            return;
        }
        this.isLoading.update(value => !value);
        try {
            await this.roleService.addClientRoleToUser(this.user().id, this.selectedRole);
            await this.initRoles(this.user().id);
            this.messageService.add({ severity: 'infos', summary: 'Information', detail: "Rôle ajouté" });
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups, une erreur s'est produite, veuillez reprendre"});
        }finally{
            this.isLoading.update(value => !value);
        }
    }

    async removeUserRole(event: any, role: Role){
        try {
            await this.roleService.removeClientRoleToUser(this.user().id, role);
            await this.initRoles(this.user().id);
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups, une erreur s'est produite, veuillez reprendre"});
        }
    }

    /**
     * Initialisation des données
     * @param userId 
     */
    async initData(userId: string){
        try {
            //récupération des infos du user
            this.user.set(
                await this.userService.getUserById(userId)
            );
            await this.initRoles(userId);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Est chargé d'initialiser les rôles en contactant le back keycloak
     * @param userId 
     */
    async initRoles(userId: string){
        try {
            //Récupération de tout ses rôles
            this.userRoles.set(
                await this.userService.getUserRoleMapping(userId)
            );
            //récupération de la liste de tout les rôles du client
            const allRoles = await this.roleService.getAllClientRoles();
            //Filtrage des rôles déja attribué
            const filteredRole = allRoles.filter(
                role => {
                    return this.userRoles().find(
                        userRole => userRole.id === role.id
                    )==undefined;
                }
            );
            this.clientRolesList.set(
                filteredRole
            );
        } catch (error) {
            console.log(error);
        }
    }
}
