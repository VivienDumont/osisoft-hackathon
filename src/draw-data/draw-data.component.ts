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
  currentViewWidth: number;
  oldviewWidth: number;
  eventHeight: string;
  shortestEventDuration: number;

  inProgress = true;
  currentClasses = {};
  currentStyles = {};
  completed = true;
  scrollOn: boolean;

  // tslint:disable-next-line:max-line-length
  constructor(@Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService, @Inject(DOCUMENT) private document: any, private _elRef: ElementRef, private renderer: Renderer2) { }

  private GetEventFrames() {

    // tslint:disable-next-line:comment-format
    // tslint:disable-next-line:max-line-length
    this.element.WebId = 'F1EmwcQX-gVflkWbQKYW5nMT5QcgTsJe8B6BGpVgANOjAbLQUElTUlYwMVxNSU5FUkFMIFBST0NFU1NJTkdcUFJPQ0VTUyBQTEFOVFxHUklORElOR1xMSU5FIDE' // Line1 webid

    const body = {
      '0': {
        'Method': 'GET',
        'Resource': `https://pisrv01.pischool.int/piwebapi/elements/${this.element.WebId}/eventframes?starttime=${this.startTime}&endtime=${this.endTime}`
      }
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

    // const params = {
    //   startTime: this.startTime,
    //   endTime: this.endTime
    // };
    // this.piWebApiService.element
    // .getEventFrames$(this.element.WebId, params)
    // .subscribe(
    //   r => {
    //     this.values = r.Items;
    //   },
    //   e => {
    //     console.error(e);
    //   }
    // );

  }

  public getPiVisionStartAndEndTime() {
    this.startTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[0].value;
    this.endTime = this.document.querySelectorAll('pv-datetime input[type="text"]')[1].value;
  }

  redrawComponent() {
    // const minEventDurSeconds = this
    let startTimeInMilliseconds = new Date(this.startTime).getTime();
    let endTimeInMilliseconds = new Date(this.endTime).getTime();
    let durationInMilliseconds = (endTimeInMilliseconds - startTimeInMilliseconds);
    this.shortestEventDuration = this.getShortestEventDuraion();
    console.log(`shortest event duration: ${this.shortestEventDuration}`);

    // We are able to fit all of the events within the symbol view
    if ( ((this.shortestEventDuration / durationInMilliseconds) * this.currentViewWidth) > this.minimumEventPixelWidth) {
      this.switchScrollState(false);
      for (const iterator1 of this.eventsDiv.nativeElement.children) {
        for (const iterator2 of iterator1.children) {
          console.log(`the iterator`)
          console.log(iterator2);
          // this.document.querySelectorAll('event id[""]')[0].id
          // @ViewChild()
        }

      }
      return
    } else { // Unable to fit all of the events within the symbol view.
             // turn scroll on, reset the width of the symbol and call this function again
             const updatedWidth = ( durationInMilliseconds * (this.minimumEventPixelWidth / this.shortestEventDuration) )
             console.log(`updateing flex-basis to ${updatedWidth}`)
             this.switchScrollState(true);
             // update the width of our event div
            //  this.renderer.setStyle(
            //    this.eventsDiv.nativeElement,
            //    'width',
            //    `${updatedWidth.toString()}px`
            //  )
      // this.eventsDiv.nativeElement.style.width = ( durationInMilliseconds * (this.minimumEventPixelWidth / this.shortestEventDuration) )
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

    // this method is for NgClass. we can use this when we want to change the class of a component based on if it is in progress or not.
  switchScrollState(scroll: boolean) {
    this.currentClasses = {
      'scroll-on' : scroll,
      'scroll-off' : !scroll
    }
  }

  setCurrentStyles() {
    this.currentStyles = {
      'font-weight': this.isMasterEvent ? 'normal' : 'bold'
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
    this.currentViewWidth = this.eventsDiv.nativeElement.offsetWidth;
    if (this.currentViewWidth !== this.oldviewWidth) {
      this.oldviewWidth = this.currentViewWidth;
      console.log(`current width: ${this.currentViewWidth}`);
      this.redrawComponent();
    } else {
      // console.log("width unchanged");
    }
  }

  // ngDoCheck() {
  //   console.log('docheck');
  // }

  ngOnChanges(changes) {
    if (changes.data) {
      // this.values = this.formatData();
    }

    if (changes.primaryEvent) {
      console.log('Primary event changed');

    }

    if (changes.defaultEventHeight) {
      this.eventHeight = `${changes.defaultEventHeight}px`;
      console.log('height Changed');
    }

    // this.GetEventFrames();
  }

}
