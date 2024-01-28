import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "../supabase.service";
import {Session, User} from "@supabase/supabase-js";
import {MatDialogRef} from "@angular/material/dialog";
import {GameService} from "../game.service";


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loading = false
  user: User | null = null
  session: Session | null = null
  stage: string = 'register'
  images: string[] = []
  progress: number = 0
  downloadStarts: boolean = false
  backgroundColor: string = '#008000'


  constructor(private readonly game: GameService,
              private readonly supabase: SupabaseService,
              public dialogRef: MatDialogRef<AuthComponent>) {
    dialogRef.disableClose = true
  }

  ngAfterViewInit() {
    const componentToHex = (c: number) => {
      const hex = c.toString(16)
      return hex.length == 1 ? "0" + hex : hex;
    }
    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
    }
    const backColor = getComputedStyle(document.body).getPropertyValue('background-color').slice(4).split(' ').map(c => parseInt(c))
    this.backgroundColor = rgbToHex(backColor[0], backColor[1], backColor[2])
  }

  ngOnInit(): void {
  }

  async handleSignIn(email: string, password: string) {
    try {
      this.loading = true
      const user = await this.supabase.signIn(email, password)
      if (user.error) {
        console.log(user.error)
      }
      if (user.data) {
        this.user = user.data.user
        this.session = user.data.session
      }
    } catch (error) {
      // @ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  async handleSignUp(email: string, password: string) {
    try {
      this.loading = true
      await this.supabase.signUp(email, password)
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  async handleSignOut() {
    try {
      this.loading = true
      await this.supabase.signOut()
      this.user = null
      this.session = null
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }


  changeStage(name: string) {
    this.stage = name === 'register' || name === 'login' ? name : ''
  }

  async playWithoutLogin() {

    //TODO: скорректировать под выбор других карточных тем в будущем
    if (this.game.cards.length) {
      this.close()
      return
    }
    const {data} = await this.supabase.cards.list('webp')
    this.progress = 0
    this.downloadStarts = true
    if (data) {
      this.images = data.filter(img => img.name !== '.emptyFolderPlaceholder').map((img) => this.supabase.cards.getPublicUrl(`webp/${img.name}`).data.publicUrl);
    }

  }

  setProgress() {
    this.progress = Math.min(this.progress + .001 + 100 / this.images.length, 100)
    if (this.progress === 100 && this.downloadStarts) {
      setTimeout(() => {
        this.downloadStarts = false;
        this.game.cardsTheme = 'webp';
        this.progress = 0;
        this.close()
      }, 1000)
    }
  }

  changeBackgroundColor() {
    document.body.style.backgroundColor = this.backgroundColor
  }


  close() {
    this.dialogRef.close()
  }
}
