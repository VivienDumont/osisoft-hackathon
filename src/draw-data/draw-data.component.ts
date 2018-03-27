/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { Component, Input, OnChanges, ElementRef, Inject, OnInit, ViewChild, Renderer2 } from '@angular/core';
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
  @Input() isMasterEvent: boolean;
  @Input() startTimeCustom: string;
  @Input() endTimeCustom: string;
  @Input() minimumEventPixelWidth: number
  @Input() showAttrInEventWidth: number;

  // OSI PI input variables
  @Input() data: any;
  @Input() pathPrefix: string;
  // @Input() events: any;

  // global variable controls
  eventFrames: any[];
  element: any = {};
  eventTypes: any[];
  startTime: string;
  endTime: string;
  @ViewChild('eventsDiv') eventsDiv: ElementRef;
  @ViewChild('view')      viewDiv: ElementRef;
  currentViewWidth: number;
  oldviewWidth: number;
  eventHeight: string;
  shortestEventDuration: number;
  minControlWidth: any;

  inProgress = true;
  scrollState = {};
  widthControl = {};
  completed = true;
  scrollOn: boolean;

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document: any, private _elRef: ElementRef, private renderer: Renderer2) { }

  private GetEventFrames() {
    // tslint:disable-next-line:comment-format
    // tslint:disable-next-line:max-line-length
    this.element.WebId = 'F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE' // Line1 webid
    // tslint:disable-next-line:max-line-length
    this.element.WebId2 = 'F1EmwcQX-gVflkWbQKYW5nMT5QfATsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDI' // line2 webid

    const body = {
      '0': {
        'Method': 'GET',
        'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${this.element.WebId}/eventframes?starttime=${this.startTime}&endtime=${this.endTime}`
      },
      '1': {
        'Method': 'GET',
        'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${this.element.WebId}`
      },
      '2': {
        'Method': 'GET',
        'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${this.element.WebId2}/eventframes?starttime=${this.startTime}&endtime=${this.endTime}`
      },
      '3': {
        'Method': 'GET',
        'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${this.element.WebId2}`
      },
    };

    this.piWebApiService.batch.execute$(body)
    .subscribe(
      r => {
        const n_bd = r.body;
        this.eventFrames = r.body[0].Content.Items;
      },
      e => {
        console.error(e);
      }
    )

    this.redrawComponent();
  }

  public getPiVisionStartAndEndTime() {
    const all_input_datetime = this.document.querySelectorAll('pv-datetime input[type="text"]');
    this.startTime = all_input_datetime[all_input_datetime.length-2].value;
    this.endTime = all_input_datetime[all_input_datetime.length-1].value;
    // this.startTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[0].value;
    // this.endTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[1].value;
  }

  redrawComponent() {
    const timeManipulator = 100;
    // const minEventDurSeconds = this
    try {
      new Date(this.startTime).getTime();
    } catch (error) {
      this.getAbsoluteDateFromRelativeTime(this.startTime)
    }

    try {
      new Date(this.endTime).getTime();
    } catch (error) {
      this.getAbsoluteDateFromRelativeTime(this.endTime);
    }
    // this.getAbsoluteDateFromRelativeTime(this.startTime);

    let startTimeInMilliseconds = new Date(this.startTime).getTime() / timeManipulator;
    let endTimeInMilliseconds = new Date(this.endTime).getTime() / timeManipulator;
    let durationInMilliseconds = (endTimeInMilliseconds - startTimeInMilliseconds);
    this.shortestEventDuration = this.getShortestEventDuraion() / timeManipulator;

    console.log('calulation result: ' + ((this.shortestEventDuration / durationInMilliseconds) * this.currentViewWidth))
    // We are able to fit all of the events within the symbol view without going below the smallest pixel size allowed
    if ( ((this.shortestEventDuration / durationInMilliseconds) * this.currentViewWidth) > this.minimumEventPixelWidth) {
      this.minControlWidth = 'inherit';

      this.widthControl = {
        'width': 'inherit'
      }

      this.switchScrollState(false);
      console.log('no need for scroll bar');
      this.eventFrames.forEach(item => {
        const start = new Date(item.StartTime).getTime();
        const end = new Date(item.EndTime).getTime();
        // tslint:disable-next-line:max-line-length
        item.duration = ( ((end) - (start)) );
        // tslint:disable-next-line:max-line-length
        item.width = ((( (end - start) ) / durationInMilliseconds) * this.currentViewWidth);
        },
        e => {
          console.log(e);
        }
      )
      return
    } else { // Unable to fit all of the events within the symbol view withouth going below minimum pixel width
      // turn scroll on, reset the width of the symbol and resize the events based on the controls new width
      const updatedWidth = ( durationInMilliseconds * (this.minimumEventPixelWidth / this.shortestEventDuration) )
      // this.minControlWidth = `${updatedWidth}px`;
      this.widthControl = {
        'width': `${updatedWidth}px`
      }

      console.log(`screen size too small to display properly`);
      this.switchScrollState(true);

      this.eventFrames.forEach(item => {
          const start = new Date(item.StartTime).getTime();
          const end = new Date(item.EndTime).getTime();
          // tslint:disable-next-line:max-line-length
          item.duration = ( start - end );
          // tslint:disable-next-line:max-line-length
          item.width = (( ((end - start)) / durationInMilliseconds) * updatedWidth);
        },
        e => {
          console.log(e);
        }
      )
    }
  }

  getShortestEventDuraion(): number {
    let startTimeCompare: number;
    let endTimeCompare: number;
    let shortestDuration = 0;
    let loopDuration = 0;

    if (this.eventFrames !== undefined) {
      this.eventFrames.forEach(
        eventFrame => {
          startTimeCompare = new Date(eventFrame.StartTime).getTime();
          endTimeCompare = new Date(eventFrame.EndTime).getTime();

          if (loopDuration === 0) {
            loopDuration = (endTimeCompare - startTimeCompare);
            shortestDuration = loopDuration
          } else {
            loopDuration = (endTimeCompare - startTimeCompare)
          }

          // is this the shortest duration so far, or is it the first itteration?
          if (loopDuration < shortestDuration) {
            shortestDuration = loopDuration;
          }

        },
        e => {
          console.log(e);
        }
      )
    } else {
      console.log(`no event frames to show`);
    }
    return shortestDuration;
  }

  getAbsoluteDateFromRelativeTime(dateString: string): string {
    let relDateStringArray: string[] = dateString.split('')
    console.log(relDateStringArray);
    let startChar = relDateStringArray[0];
    let mathSignChar = relDateStringArray[1];
    let numberChar = relDateStringArray[2];
    let rangeChar = relDateStringArray[3];

    console.log(startChar + mathSignChar + numberChar + rangeChar);
    // new Date(this.startTime).set setHours() ()
    return dateString;
  }

    // this method is for NgClass. we can use this when we want to change the class of a component based on if it is in progress or not.
  switchScrollState(scroll: boolean) {
    this.scrollState = {
      'scroll-on' : scroll,
      'scroll-off' : !scroll
    }
  }

  setCurrentStyles() {
    this.widthControl = {
      'width': this.isMasterEvent ? 'normal' : 'bold'
    }
  }

  // -------------------ANGUALR EVENTS--------------
  ngOnInit() {
    setInterval(() => {
      this.getPiVisionStartAndEndTime();
      this.GetEventFrames();
      }, 5000);
  }

  // This method is used to check the size of the div
  ngAfterViewChecked() {
    // this.currentViewWidth = this.eventsDiv.nativeElement.offsetWidth;
    this.currentViewWidth = this.viewDiv.nativeElement.offsetWidth;
    if (this.currentViewWidth !== this.oldviewWidth) {
      this.oldviewWidth = this.currentViewWidth;
      console.log(`redrawing component`);
      this.redrawComponent();
    }
    else{
      console.log('no change in screen size');
    }
  }

  ngOnChanges(changes) {
    if (changes.data) {
      // this.values = this.formatData();
    }

    if (changes.primaryEvent) {

    }

    if (changes.defaultEventHeight) {
      this.eventHeight = `${changes.defaultEventHeight}`;
    }

    this.GetEventFrames();
  }

}
