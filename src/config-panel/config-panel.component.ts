import { Component, Input, Output, EventEmitter, Inject, OnInit } from '@angular/core';
import { ConfigComponent, PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi'

@Component({
  selector: 'config-panel',
  templateUrl: 'config-panel.component.html',
  styleUrls: ['config-panel.component.css']
})
export class ConfigPanelComponent implements ConfigComponent, OnInit{
    paramIndex: number;
    selectedSymbols: any[];
    changeLayout: EventEmitter<any> = new EventEmitter;
    changeParam: EventEmitter<any> = new EventEmitter;

    elementcategory: any;
    elementsTOshow = [];
    EFcategory:any;
    EFtemplate:any;
    selectedELEF:any = [];
    AttributeofselectedELEF:any;
    selectedelefRow: any;

    isShow: boolean = true;
    
    serverName: string = '';
    values = [];

    constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) { }

    BuildData(body) {
        this.values = [];
        body[1].Content.Items.forEach(db => {
          const to_add = db;
          const index = body[1].Content.Items.indexOf(db);
          to_add.elements = body[2].Content.Items[index].Content.Items;
          this.values.push(to_add);
        });
    
        this.values.forEach(db => {
          db.elements.forEach(element => {
            this.GetElement(element);
          });
          //this.AnalysesDatabase(db);
        });

        
        console.log(this.values);
      }

      private GetElement(element){

        this.piWebApiService.element.getElements$(element.WebId)
        .subscribe(
          r=>{
            element.elements = r.Items;
            element.elements.forEach(e => {
              if(e.HasChildren){
                this.GetElement(e);
              } else {
                this.AnalysesElement(e)
                this.elementsTOshow.push(e);
              }
            });
          },
          e=>{
            console.error(e);
          }
        );
      }

      AnalysesElement(element){
        this.piWebApiService.element.getAnalyses$(element.WebId)
        .subscribe(
          r=>{
            element.analysesTemplateEventType = [];
            element.attributeTemplate = [];
            r.Items.forEach(template => {
              if (template.AnalysisRulePlugInName === 'EventFrame'){
                element.analysesTemplateEventType.push(template);
              } else {
                element.attributeTemplate.push(template);
              }
              
            });
          },
          e=>{
            console.error(e);
          }
        );
      }

    Get(){
        this.elementsTOshow = [];
        const body = { 
            "0": {
                "Method": "GET",
                "Resource": "https://pisrv01.pischool.int/piwebapi/assetservers?name=" + this.serverName
            },
            "1": {
                "Method": "GET",
                "Resource": "https://pisrv01.pischool.int/piwebapi/assetservers/{0}/assetdatabases?selectedFields=Items.WebId;Items.Id;Items.Path;Items.Name;Items.Description;Items.Links.Elements",
                "Parameters": [
                "$.0.Content.WebId"
                ],
                "ParentIds": [
                "0"
                ]
            },
            "2": {
                "Method": "GET",
                "RequestTemplate": {
                "Resource": "$.1.Content.Items[*].Links.Elements"
                },
                "ParentIds": [
                "1"
                ]
            }
        };
    
        this.piWebApiService.batch.execute$(body)
        .subscribe(r => {
            this.BuildData(r.body);
        },
        e => {
        console.error(e);
        });
    }

    ngOnInit(){

        
    }

    ngOnChanges(changes) {
        console.log(changes);
        if(changes){
            if(this.serverName !== changes.selectedSymbols.currentValue[0].props.serverName){
                this.serverName = changes.selectedSymbols.currentValue[0].props.serverName;
                this.Get();
            }
        }
    }

    HideShow(){
        this.isShow = !this.isShow;
    }

    GoUp(){

    }

    GoDown(){

    }

    Add(){
        const to_add = {
            element: this.elementcategory,
            ef: this.EFtemplate,
            master: false
        }
        
        if(this.selectedELEF.length == 0){
            to_add.master = true;
        }

        this.selectedELEF.push(to_add);


    }

    Delete(){
        this.selectedELEF = this.selectedELEF.filter(obj => obj.element.WebId !== this.selectedelefRow.element.WebId || obj.ef.WebId !== this.selectedelefRow.ef.WebId)
        if(this.selectedelefRow.master){
            if(this.selectedELEF.length>0){
                this.selectedELEF[0].master=true;
            }
        }
    }

    SelectElement(item){
        this.elementcategory = this.elementsTOshow.find(x => x.WebId === item);
    }

    SelectEFType(item){
        this.EFtemplate = this.elementcategory.analysesTemplateEventType.find(x => x.WebId === item);
    }
    SelectEFELRow(item){
        this.selectedelefRow = item;
    }
    NewMaster(item){
        if(item.master)
        {
            this.selectedELEF.forEach(x => {
                x.master=false;
            })    
        }
        item.master = true;
    }
}