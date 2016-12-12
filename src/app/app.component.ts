import { Component} from '@angular/core';//,Directive, ComponentMetadata, Input, ReflectiveInjector, ViewContainerRef, Compiler,NgModule 
import { RoleService } from './role.service';

@Component({
  //moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',//
  styleUrls: ['app.component.css'],
  providers :[RoleService],
})
export class AppComponent {
  title = 'Fireform 3';
   constructor( public rs: RoleService) {
    this.rs.role = 0;
  } 
}