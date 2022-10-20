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

  constructor(private readonly game: GameService,
              private readonly supabase: SupabaseService,
              public dialogRef: MatDialogRef<AuthComponent>) {
    dialogRef.disableClose = true
  }

  ngOnInit(): void {

    this.supabase.cards.list('default').then(({data}) => {
      if (data) {

        this.images = data.filter(img => img.name !== '.emptyFolderPlaceholder').map((img) => this.supabase.cards.getPublicUrl(`default/${img.name}`).data.publicUrl);

      }
    })
  }

  async handleLogin(email: string, password: string) {
    try {
      this.loading = true
      const user = await this.supabase.signIn(email, password)
      if (user.error) console.log(user.error)
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

  playWithoutLogin() {
    this.dialogRef.close()
    if (!this.game.cards?.length)
      this.progress = 0
    for (let src of this.images) {
      let img = new Image()
      img.onload = () => {
        this.progress += this.images.length / 100
      }
      img.src = src
    }
    this.game.cardsTheme = 'default'
  }

  close() {
    this.dialogRef.close()
  }
}
