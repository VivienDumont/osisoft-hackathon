/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, OnInit, OnDestroy, Inject } from '@angular/core';
import { PiWebApiService } from '@osisoft/piwebapi';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
// import { DxDataGridModule, DxDataGridComponent } from 'devextreme-angular';


@Component({
  selector: 'example',
  templateUrl: 'data-grid.component.html',
  styleUrls: ['data-grid.component.css']
})
export class DataGridComponent implements OnChanges, OnInit, OnDestroy {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
  
  eventFrames: any = [];
  lst_range:any = [];
  lst_attribute:  any = [];
  element_ef: string = 'Element/EventType';
  starttime: string;
  endtime: string;

  intervalNum: any;

  webidElement = 'F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE';
  webidEF = 'F1FmwcQX-gVflkWbQKYW5nMT5QPwGrAxw36BGpYQANOjr-FgUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcRVZFTlRGUkFNRVNbT1NJREVNT19QUk9DRVNTIFNMT1dET1dOIExJTkUgMSAyMDE4LTA0LTAzIDA0OjUwXQ';
  ef_type = 'Process Slowdown';

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document: any){

  }

  ngOnChanges(changes) {
    if (changes) {

    }
  }

  ngOnInit() {
    this.intervalNum = setInterval(() => {
      const all_input_datetime = this.document.querySelectorAll('pv-datetime input[type="text"]');
      this.starttime = all_input_datetime[all_input_datetime.length-2].value;
      this.endtime = all_input_datetime[all_input_datetime.length-1].value;
      this.GetEventFrames();
    }, 10000)
  }

  ngOnDestroy() {
    //clearInterval(this.intervalNum);
  }

  GetEventFrames() {
    const body = {
      "0":{
        "Method":"GET",
        "Resource": `https://pisrv01.pischool.int/piwebapi/elements/${this.webidElement}/eventframes?starttime=${this.starttime}&endtime=${this.endtime}`
      }
    };
    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        this.eventFrames = r.body[0].Content.Items.filter(x => x.TemplateName === this.ef_type || x.TemplateName.indexOf(this.ef_type)+1 || this.ef_type.indexOf(x.TemplateName)+1);
        this.lst_range = [];
        this.eventFrames.forEach((ef, index) => {
          const toadd = {
            StartTime: ef.StartTime.replace('T', ' ').replace('Z', ''),
            EndTime: (ef.EndTime.indexOf('9999')+1)? '-' : ef.EndTime.replace('T', ' ').replace('Z', '')
          }
          this.lst_range.push(toadd);
          this.GetAttributes(ef, index);
        });
      },
      e => {
        console.error(e);
      }
    );
  }

  GetAttributes(eventFrame, index) {
    this.piWebApiService.eventFrame.getAttributes$(eventFrame.WebId)
    .subscribe(
      r => {
        const attributes = r.Items;
        attributes.forEach(attr => {
          let found = this.lst_attribute.find(x => x.Name && x.Name.toString().indexOf(attr.Name.toString())+1);
          if(!found){
            const to_add = {
              Name: attr.Name.toString(),
              Values: []
            };
            this.lst_attribute.push(to_add);
            found = to_add;
          }

          const index_attr = this.lst_attribute.indexOf(found);

          this.GetValueOfAttribute(attr, index, index_attr);
          
        });
      },
      e => {
        console.error(e);
      }
    );
  }

  GetValueOfAttribute(attr, index, index_attr){
    this.piWebApiService.stream.getValue$(attr.WebId)
    .subscribe(
      r => {
        let value = r.Value;
        if(attr.HasChildren){
          value = value.Value;
        }
        this.lst_attribute[index_attr].Values[index] = value;
      },
      e => {
        console.error(e);
      }
    );
  }

}
