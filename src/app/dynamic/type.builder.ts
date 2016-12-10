import { Component, ComponentFactory, NgModule,OnInit, Input, Injectable } from '@angular/core';
import { RuntimeCompiler } from '@angular/compiler';

import { PartsModule } from '../parts/parts.module';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';

export interface IHaveDynamicData {
    exdata: any;
    data: any;
    datanewrow: any;
    //listobj: any;
    InitialList(dstable: any): void;
    // UpdateNew(ds: string, rep: string, fieldList: string, v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any, v9: any, v10: any
    //     , v11: any, v12: any, v13: any, v14: any, v15: any, v16: any, v17: any, v18: any, v19: any, v20: any
    //     , v21: any, v22: any, v23: any, v24: any, v25: any, v26: any, v27: any, v28: any, v29: any, v30: any
    //     , v31: any, v32: any, v33: any, v34: any, v35: any, v36: any, v37: any, v38: any, v39: any, v40: any): void;
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

    protected createNewComponent(tmpl: string, dtable: any) {
        @Component({
            selector: 'dynamic-component',
            template: tmpl,
        })
        class CustomDynamicComponent implements IHaveDynamicData, OnInit {
            @Input() exdata: any;
            @Input() data: any;
            @Input() datanewrow: any;
            //@Input() listobj: any;
            public listobj = {};
            public rowediting = {};
            public rowdata = {};
            public isDsLoaded = false;
            constructor(public af: AngularFire) {
                //this.listobj['f03.t1'] = this.af.database.list("/forms/f03/data/block/t1");
                //this.InitialList(dtable);
            }
            ngOnInit() {
                //this.listobj['f03.t1'] = this.af.database.list("/forms/f03/data/block/t1");
                this.InitialList(dtable);
            }
            public InitialList(dstable: any) {
                for (var item in dstable) {
                    let n: string = item;
                    let pos = n.indexOf('.', 0);
                    let ds = n.substring(1, pos);
                    let rep = n.substring(pos + 1, n.length - 1);
                    let s = "/forms/" + ds + "/data/block/" + rep;
                    let sname =  ds + "." + rep ;

                    this.listobj[sname] = this.af.database.list(s);
                }
               
            }
            getlist(ds: string, rep: string): any {
                return this.listobj[ds + '.' + rep];
            }

            SetEdit(ds: string, rep: string, fieldlist: string, obj: any): void {
                console.log("SetEdit:" + obj.$key);
                this.rowediting[obj.$key] = true;
                var nl = fieldlist.split(',');
                for (var i = 0; i < nl.length; i++) {
                    let n = nl[i];
                    this.rowdata[obj.$key + n] = obj[n];// eval('dataobj.' + n);
                }
            }
            DeleteRow(ds: string, rep: string, rkey: string): void {
                console.log("Delete row:" + rkey);
                this.af.database.object("/forms/" + ds + "/data/block/" + rep + "/" + rkey).remove();
            }
            CancelEdit(rkey: string): void {
                console.log("Cancel:" + rkey);
                this.rowediting[rkey] = false;;
            }
            Update(ds: string, rep: string, fieldlist: string, rkey: string): void {
                console.log("Update:" + ds + rep + fieldlist + rkey);
                this.rowediting[rkey] = false;

                let pl = "";
                var nl = fieldlist.split(',');
                const item = this.af.database.object("/forms/" + ds + "/data/block/" + rep + "/" + rkey);
                for (var i = 0; i < nl.length; i++) {
                    let n = nl[i];
                    pl = pl + n + ': ' + this.rowdata[rkey + n] + ',';
                }
                pl = pl.substring(0, pl.length - 1);
                let ss = 'item.update({' + pl + '});';
                eval(ss);
            }
            UpdateNew(ds: string, rep: string, fieldList: string
                , v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any, v9: any, v10: any
                , v11: any, v12: any, v13: any, v14: any, v15: any, v16: any, v17: any, v18: any, v19: any, v20: any
                , v21: any, v22: any, v23: any, v24: any, v25: any, v26: any, v27: any, v28: any, v29: any, v30: any
                , v31: any, v32: any, v33: any, v34: any, v35: any, v36: any, v37: any, v38: any, v39: any, v40: any) {

                let pl = "";
                if (ds !== undefined) {
                    var nl = fieldList.split(',');
                    //let d = (new Date()).toISOString().substr(0, 10);
                    const item = this.af.database.list("/forms/" + ds + "/data/block/" + rep);
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