import { Component, Input, OnInit } from "@angular/core";
import { DialogModule } from "primeng/dialog";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@Component({
    standalone: true,
    selector: 'app-keycloak-loading',
    imports: [
        DialogModule,
        ProgressSpinnerModule
    ],
    template: `
        <p-dialog [(visible)]="visible" [closable]="false" [modal]="true">
            <p-progressSpinner ariaLabel="loading"></p-progressSpinner>
        </p-dialog>
    `
})
export class KeycloakLoadingComponent implements OnInit {
    
    @Input({required: true}) visible: boolean = false;
    constructor() { }

    ngOnInit(): void { }
}