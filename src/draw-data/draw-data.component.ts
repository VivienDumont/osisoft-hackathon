/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, ElementRef, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { PIWEBAPI_TOKEN } from '../framework';
import { PiWebApiService } from '@osisoft/piwebapi';

@Component({
  selector: 'draw-data',
  templateUrl: 'draw-data.component.html',
  styleUrls: ['draw-data.component.css']
})
export class DrawDataComponent implements OnChanges, OnInit {
  @Input() primaryEvent: string;
  @Input() defaultEventHeight: number;
  @Input() bkColor: string;
  @Input() lineColor: string;
  @Input() height: number;
  @Input() isMasterEvent: boolean;
  @Input() timeControl
  @Input() minimumEventPixelWidth: number

  @Input() data: any;
  @Input() pathPrefix: string;
  // @Input() events: any;

  values: any[];
  element: any = {};
  eventTypes: any[];
  startTime: string;
  endTime: string;

  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document: any) { }

  private GetEventFrames() {

    this.element.WebId = "F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE" //Line1 webid

    const params = {
      startTime: this.startTime,
      endTime: this.endTime
    };
    this.piWebApiService.element
    .getEventFrames$(this.element.WebId, params)
    .subscribe(
      r => {
        this.values = r.Items;
      },
      e => {
        console.error(e);
      }
    );
  }

  // formatData() {
  //   if (this.isDataValid()) {
  //     return this.data.body.map(r => ({ path: r.path, value: this.formatValue(r.value) }));
  //   } else {
  //     return [];
  //   }
  // }

  private isDataValid(): boolean {
    return this.data && this.data.body && this.data.body.length;
  }

  public getPiVisionStartAndEndTime() {
    this.startTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[0].value;
    this.endTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[1].value;
    console.log(this.startTime);
    console.log(this.endTime);
  }

  ngOnInit() {
    this.GetEventFrames();
    // this.piWebApiService.element.getAnalyses$(this.element.WebId)
    // .subscribe(
    //   r => {
    //     this.element.analysesTemplateEventType = r.Items;
    //     r.Items.forEach(template => {
    //       if (template.AnalysisRulePlugInName === 'EventFrame') {
    //         this.element.analysesTemplateEventType.push(template);
    //       }
    //     });
    //   },
    //   e => {
    //     console.error(e);
    //   }
    // );

    setInterval(() => {
      this.getPiVisionStartAndEndTime();
      this.GetEventFrames();
      }, 5000);

    // setInterval(function(){ alert("Hello"); }, 3000);

    // this.db.databaseid = 'F1RDwcQX-gVflkWbQKYW5nMT5QSklzpJw7KkqsKfR4zvzt6gUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkc'
    // this.piWebApiService.assetDatabase.getAnalysisTemplates$(this.db.databaseid, null)
    // .subscribe(
    //   r => {
    //     this.db.analysesTemplateEventType = [];
    //     r.Items.forEach(template => {
    //       if (template.AnalysisRulePlugInName === 'EventFrame') {
    //         this.db.analysesTemplateEventType.push(template);
    //       }
    //     });
    //   },
    //   e => {
    //     console.error(e);
    //   }
    // );
  }

  ngOnChanges(changes) {
    if (changes.data) {
      // this.values = this.formatData();
    }

    if (changes.primaryEvent) {
      console.log('Primary event changed');
    }
    this.GetEventFrames();
  }

}
