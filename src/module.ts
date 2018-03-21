import { NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType, PIWEBAPI_TOKEN } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { PiWebApiService, Request, ElementItemsField } from '@osisoft/piwebapi';

import { ExampleComponent } from './example/example.component';
import { ExtractDataComponent } from './extract-data/extract-data.component';

@NgModule({
  declarations: [ ExampleComponent, ExtractDataComponent ],
  imports: [ CommonModule ] ,
  exports: [ ExampleComponent, ExtractDataComponent ],
  entryComponents: [ ExampleComponent, ExtractDataComponent ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'example-symbol',
      displayName: 'Example Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExampleComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
          ]
        }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    },
    {
      name: 'extract-data-symbol',
      displayName: 'Extract Data Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ExtractDataComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Extract Data Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' },
            { propName: 'serverName', displayName: 'Server Name', configType: ConfigPropType.Text, defaultVal: 'PISRV01' },
            { 
              propName: 'servers', displayName: 'Servers', configType: ConfigPropType.Dropdown, defaultVal: 'PISRV01',
              configItems: [
                { text: 'PISRV01', value: 'PISRV01' },
                { text: 'PISRV02', value: 'PISRV02' }
              ]
            }
          ]
        }
      ],
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];

  constructor() {
    super();
  }
}
