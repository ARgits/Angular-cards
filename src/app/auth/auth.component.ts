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


  constructor(private readonly game: GameService,
              private readonly supabase: SupabaseService,
              public dialogRef: MatDialogRef<AuthComponent>) {
    dialogRef.disableClose = true
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
        console.log(user.data)
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
      await this.supabase.signUp(email,password)
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

    //Если карты уже было созданы, ничего снова подгружать не надо
    //TODO: скорректировать под выбор других карточных тем в будущем
    if (this.game.cards.length) {
      this.close()
      return
    }
    console.log('карты не были созданы, загружаем...')
    const {data} = await this.supabase.cards.list('default')
    this.progress = 0
    this.downloadStarts = true
    if (data) {
      this.images = data.filter(img => img.name !== '.emptyFolderPlaceholder').map((img) => this.supabase.cards.getPublicUrl(`default/${img.name}`).data.publicUrl);
    }
    console.log(this.images)

  }

  setProgress() {
    console.log('изображение загружается', this.images.length)
    this.progress = Math.min(this.progress + .001 + 100 / this.images.length, 100)
    console.log('изображение загружено, прогресс: ', this.progress, '%')
    if (this.progress === 100 && this.downloadStarts) {
      setTimeout(() => {
        this.downloadStarts = false;
        this.game.cardsTheme = 'default';
        this.progress = 0;
        this.close()
      }, 1000)
      this.downloadStarts = false
    }
  }


  close() {
    this.dialogRef.close()
    this.game.state = 'active'
  }
}
