import { Controller, Get, Param } from '@nestjs/common';
import { EmailTemplateType } from './email-template-type';
import { EmailingService } from './emailing.service';

@Controller('emailingdev')
export class EmailingDevController {
  constructor(private emailingService: EmailingService) { }

  @Get('preview/:templateType')
  public downloadFile(@Param('templateType') templateTypeKey: EmailTemplateType) {
    const availableTypes = Object.keys(EmailTemplateType);
    if (!availableTypes.includes(templateTypeKey)) {
      return `Inexisting template type ${templateTypeKey}. Choose among ${availableTypes.join(", ")}.`;
    }

    const templateType = EmailTemplateType[templateTypeKey] as EmailTemplateType;
    return this.emailingService.templatify(templateType, {
      ...this.emailingService.getGenericTemplateData(),
      ...this.getPlaceholderData(templateType)
    }, true)
  }

  private getPlaceholderData(templateType: EmailTemplateType) {
    switch (templateType) {
      case EmailTemplateType.ARBITRATION_REQUEST:
        return {
          arbiterDashboardUrl: "https://arbiter.bel2.org/dashboard"
        }
      case EmailTemplateType.EMAIL_VERIFICATION:
        return {
          pinCode: "1234"
        }
      default:
        return {};
    }
  }
}