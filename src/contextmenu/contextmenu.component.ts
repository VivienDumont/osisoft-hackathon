import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-contextmenu',
  templateUrl: 'contextmenu.component.html',
  styleUrls: ['contextmenu.component.css']
})
export class ContextmenuComponent{

  @Input() x=0;
  @Input() y=0;
  @Output() emitterSelection: EventEmitter<any> = new EventEmitter();

  constructor() { }


  ChooseElement(){
    this.emitterSelection.emit('element');
  }

  ChooseAttribute(){
    this.emitterSelection.emit('attribute');
  }
}