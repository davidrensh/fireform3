import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TempeditorComponent } from '../tempeditor/tempeditor.component';
import { AppComponent } from '../app.component';
import { LoaderComponent } from '../loader/loader.component';
import { ListComponent } from '../list/list.component';
import { ShowComponent } from '../show/show.component';
import { ApiComponent } from '../api/api.component';
const appRoutes: Routes = [
  { path: 'editor', component: TempeditorComponent },
  { path: 'list', component: ListComponent },
  { path: 'show', component: ShowComponent },
  { path: 'loader', component: LoaderComponent },
  { path: 'api', component: ApiComponent },
    { path: '', component: ListComponent },
];

export const appRoutingProviders: any[] = [

];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);