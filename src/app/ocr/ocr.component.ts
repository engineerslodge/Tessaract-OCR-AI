import { Component } from '@angular/core';
import * as Tesseract from 'tesseract.js';

@Component({
  selector: 'app-ocr',
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OCRComponent {

  file: File | null = null;
  status: string | null = null;
  result: string | null = null;

  constructor(private imageProcessingService: ImageProcessingService) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
    }
  }

  async processImage() {
    if (!this.file) {
      alert('Please select an image file first.');
      return;
    }

    this.status = 'Processing...';

    try {
      const canvas = await this.imageProcessingService.preprocessImage(this.file);
      const imageBlob = await new Promise<Blob>(resolve => canvas.toBlob(resolve, 'image/jpeg'));

      Tesseract.recognize(
        imageBlob,
        'eng',
        {
          logger: info => console.log(info) // Log progress information
        }
      ).then(({ data: { text } }) => {
        this.status = 'Done!';
        this.result = text;
      }).catch(error => {
        this.status = 'Error!';
        console.error(error);
      });
    } catch (error) {
      this.status = 'Error during preprocessing!';
      console.error(error);
    }
  }

}
