import { Pipe, PipeTransform } from '@angular/core';
import { Global } from '../_global/global';

@Pipe({
  name: 'timestamp'
})
export class TimestampPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!value){
      return '';
    }
    let val = Math.round(value);
    if(isNaN(val)){
      return ''
    }else{
      return Global.getTimeStamp(val);
    }
  }

}
