import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomUrlSerializer extends DefaultUrlSerializer implements UrlSerializer {
  override parse(url: string): UrlTree {
    url = url
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/;/g, '%3B')
      .replace(/:/g, '%3A');
    return super.parse(url);
  }

  override serialize(tree: UrlTree): string {
    // Đảm bảo serialize không bị double encode nếu cần.
    return super.serialize(tree);
  }
}
