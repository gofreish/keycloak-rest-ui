import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { RoleService } from '../service/role.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DefaultRole, Role } from '../model/role.model';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';
import { KeycloakLoadingComponent } from '../shared/keycloak-loading.component';

@Component({
  selector: 'app-keycloak-role',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ToolbarModule,
    CardModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    KeycloakLoadingComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './keycloak-role.component.html',
})
export class KeycloakRoleComponent implements OnInit {
    
    roles: WritableSignal<Role[]> = signal([]);
    isLoading: WritableSignal<boolean> = signal(false);
    roleForm!: FormGroup;
    roleFormDialog: boolean = false;

    constructor(
        private roleService: RoleService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router
    ){}

    ngOnInit(): void {
        this.initForm();
        this.updateRolesList();
    }

    updateRolesList(){
        this.isLoading.update(value => !value);
        this.roleService.getAllClientRoles()
        .then(
            roles => {
                this.roles.set(roles);
                console.log(roles);
            }
        ).catch(
            err => console.log(err)
        ).finally(
            () => this.isLoading.update(value => !value)
        );
    }

    initForm(){
        this.roleForm = this.fb.group({
            id: [""],
            name: ["", Validators.required],
            description: [""]
        });
    }

    async roleFormSubmit(){
        const role = this.roleForm.value as Role;
        this.isLoading.update(value => !value);
        try {
            if(role.id){
                //c'est un update
                const roleIndex = this.findRoleIndexById(role.id);
                if(roleIndex){
                    //Role trouvé
                    const arrayRole = this.roles()[roleIndex];
                    await this.roleService.updateClientRole(arrayRole.name, role);
                }else{
                    //erreur role introuvable
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups une erreur s'est produite" });
                    return;
                }
            }else{
                //c'est un new
                const savedRole = await this.roleService.createClientRole(role);
                console.log(savedRole);
            }
            this.roleFormDialog = false;
            this.roleForm.patchValue({
                id: "",
                name: "",
                description: ""
            });
            this.updateRolesList();
            this.messageService.add({ severity: 'info', summary: 'Terminé', detail: "Opération terminée avec succès" });
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `${error}` });
        }finally{
            this.isLoading.update(value => !value);
        }
    }

    addNewForm(){
        this.roleForm.patchValue({
            id: "",
            name: "",
            description: ""
        });
        this.roleFormDialog = true;
    }
    
    updateForm(role: Role){
        this.roleForm.patchValue({
            id: role.id,
            name: role.name,
            description: role.description
        });
        this.roleFormDialog = true;
    }

    deleteRoleConfirm(event: Event, role: Role) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Voulez vous vraiment supprimer ce rôle ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon:"none",
            acceptLabel: "Oui",
            rejectIcon:"none",
            rejectLabel: "Non",
            rejectButtonStyleClass:"p-button-text",
            accept: () => {
                this.roleService.deleteRole(role)
                .then(
                    resp => {
                        this.updateRolesList();
                        this.messageService.add({ severity: 'info', summary: 'Terminé', detail: 'Suppression terminée' });
                    }
                )
                .catch(
                    error => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `${error}` })
                );
            }
        });
    }

    roleDetail(role: Role){
        this.router.navigateByUrl(`/keycloak/roles/detail/${role.name}`);
    }

    findRoleIndexById(id: string): number|undefined{
        const index = this.roles().findIndex(
            role => role.id === id
        );
        return index != -1 ? index : undefined;
    }
}
