import { Component, ComponentFactory, NgModule, Input, Injectable } from '@angular/core';
import { RuntimeCompiler } from '@angular/compiler';

import { PartsModule } from '../parts/parts.module';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

export interface IHaveDynamicData {
    exdata: any;
    data: any;
    datanewrow: any;
    UpdateNew(ds: string, rep: string, fieldList: string, v1:any, v2:any, v3:any, v4:any, v5:any): void;
}

@Injectable()
export class DynamicTypeBuilder {

    // wee need Dynamic component builder
    constructor(
        protected compiler: RuntimeCompiler
    ) { }

    // this object is singleton - so we can use this as a cache
    private _cacheOfFactories: { [templateKey: string]: ComponentFactory<IHaveDynamicData> } = {};

    public createComponentFactory(template: string, mydata: any)
        : Promise<ComponentFactory<IHaveDynamicData>> {

        let factory = this._cacheOfFactories[template];

        if (factory) {
            console.log("Module and Type are returned from cache")

            return new Promise((resolve) => {
                resolve(factory);
            });
        }

        // unknown template ... let's create a Type for it
        let type = this.createNewComponent(template, mydata);
        let module = this.createComponentModule(type);

        return new Promise((resolve) => {
            this.compiler
                .compileModuleAndAllComponentsAsync(module)
                .then((moduleWithFactories) => {
                    //factory = _.find(moduleWithFactories.componentFactories, { componentType: type });
                    factory = moduleWithFactories.componentFactories.find(x => x.componentType === type);
                    this._cacheOfFactories[template] = factory;

                    resolve(factory);
                });
        });
    }

    protected createNewComponent(tmpl: string, mydata: any) {
        @Component({
            selector: 'dynamic-component',
            template: tmpl,
        })
        class CustomDynamicComponent implements IHaveDynamicData {
            @Input() exdata: any;
            @Input() data: any;
            @Input() datanewrow: any; 
            constructor(public af: AngularFire) {
            }
            UpdateNew(ds: string, rep: string, fieldList: string, v1:any, v2:any, v3:any, v4:any, v5:any) {
                //console.log("UpdateNew:" + ds + rep + fieldList);
                //console.log("XX This eval v1 v2 v3:" + eval("v1") + eval("v2") + eval("v3"));
                let pl = "";
                if (ds !== undefined) {
                    var nl = fieldList.split(',');
                    //let d = (new Date()).toISOString().substr(0, 10);
                    const item = this.af.database.list("/forms/" + ds + "/data/block/" + rep );
                    //let dataname = "'" + ds + "." + rep + "." + nl + "'";
                    //console.log("dataname:" + dataname );
                    for (var i = 0; i < nl.length; i++) {
                        let n = nl[i];
                       // let dataname = "'" + ds + "." + rep + "." + n + "'";
                        pl = pl + n + ': v' + n.substring(1) + ',';
                    }
                    eval('item.push({' + pl + '});');
                }
            }
        };
        // a component for this particular template
        return CustomDynamicComponent;
    }
    protected createComponentModule(componentType: any) {
        @NgModule({
            imports: [
                PartsModule, // there are 'text-editor', 'string-editor'...
            ],
            declarations: [
                componentType
            ],
        })
        class RuntimeComponentModule {
        }
        // a module for just this Type
        return RuntimeComponentModule;
    }
}