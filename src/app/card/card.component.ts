import {Component, Input, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {SupabaseService} from "../supabase.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  card?: SafeResourceUrl | undefined

  @Input() set cardUrl(urlArr: string[]) {
    if (urlArr) {
      const url = urlArr.join('/')
      this.downloadImage(url)
    }
  }


  constructor(
    private readonly supabase: SupabaseService,
    private readonly dom: DomSanitizer
  ) {
  }

  async downloadImage(path: string) {
    try {
      const {data} = await this.supabase.downloadImage(path)
      if (data instanceof Blob) {
        this.card = this.dom.bypassSecurityTrustResourceUrl(
          URL.createObjectURL(data)
        )
      }
    } catch ({message}) {
      console.error(`Error downloading image: `, message)
    }
  }

  ngOnInit(): void {
  }

}
