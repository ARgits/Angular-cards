import {Injectable} from '@angular/core';
import {SupabaseStorageClient} from '@supabase/storage-js'
import {AuthChangeEvent, createClient, Session, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../../environment";

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient

  private supabaseStorage: SupabaseStorageClient

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    )
    this.supabaseStorage = new SupabaseStorageClient(
      environment.storageUrl, {
        apikey: environment.serviceKey,
        Authorization: `Bearer ${environment.serviceKey}`
      }
    )
  }

  get user() {
    return this.supabase.auth.user()
  }

  get session() {
    return this.supabase.auth.session()
  }

  get cards() {
    return this.supabaseStorage.from('cards')
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  downloadImage(path: string) {
    console.log(path)
    return this.supabaseStorage.from('cards').download(path)
  }

}
