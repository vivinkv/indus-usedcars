import type { Schema, Struct } from '@strapi/strapi';

export interface ButtonButton extends Struct.ComponentSchema {
  collectionName: 'components_button_buttons';
  info: {
    description: '';
    displayName: 'Button';
  };
  attributes: {
    Label: Schema.Attribute.String;
    URL: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface CarFindMoreSection extends Struct.ComponentSchema {
  collectionName: 'components_car_find_more_sections';
  info: {
    displayName: 'Find More Section';
  };
  attributes: {
    Content: Schema.Attribute.String;
    Icon: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
    URL: Schema.Attribute.String;
  };
}

export interface CarImage extends Struct.ComponentSchema {
  collectionName: 'components_car_images';
  info: {
    description: '';
    displayName: 'Image';
  };
  attributes: {
    Back_Image: Schema.Attribute.Media<'images' | 'files'>;
    Front_Image: Schema.Attribute.Media<'images' | 'files'>;
    LeftSide_Image: Schema.Attribute.Media<'images' | 'files'>;
    RightSide_Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface CarInspectionReportSection extends Struct.ComponentSchema {
  collectionName: 'components_car_inspection_report_sections';
  info: {
    displayName: 'Inspection Report Section';
  };
  attributes: {
    Icon: Schema.Attribute.Media<'images' | 'files'>;
    Report_Status: Schema.Attribute.Enumeration<['Pass', 'Fail']>;
    Title: Schema.Attribute.String;
  };
}

export interface CommonAuthor extends Struct.ComponentSchema {
  collectionName: 'components_common_authors';
  info: {
    displayName: 'Author';
  };
  attributes: {
    Name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Anonymous'>;
    Profile: Schema.Attribute.Media<'images' | 'files'>;
    Rating: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
  };
}

export interface CommonBenefitSection extends Struct.ComponentSchema {
  collectionName: 'components_common_benefit_sections';
  info: {
    displayName: 'Benefit Section';
  };
  attributes: {
    Button: Schema.Attribute.Component<'button.button', false>;
    Icon: Schema.Attribute.Media<'images' | 'files'>;
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Points: Schema.Attribute.Component<'common.points', true>;
    Title: Schema.Attribute.String;
    URL: Schema.Attribute.String;
  };
}

export interface CommonBenefitsAndAdvantagesSection
  extends Struct.ComponentSchema {
  collectionName: 'components_common_benefits_and_advantages_sections';
  info: {
    displayName: 'Benefits and Advantages Section';
  };
  attributes: {
    Icon: Schema.Attribute.Media<'images' | 'files'>;
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Points: Schema.Attribute.Component<'common.points', true>;
    Title: Schema.Attribute.String;
    URL: Schema.Attribute.String;
  };
}

export interface CommonFaq extends Struct.ComponentSchema {
  collectionName: 'components_common_faqs';
  info: {
    description: '';
    displayName: 'FAQ';
  };
  attributes: {
    Button: Schema.Attribute.Component<'button.button', false>;
    Questions: Schema.Attribute.Component<'common.questions', true>;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Frequently Asked Questions'>;
  };
}

export interface CommonPoints extends Struct.ComponentSchema {
  collectionName: 'components_common_points';
  info: {
    displayName: 'Points';
  };
  attributes: {
    Icon: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
  };
}

export interface CommonQuestions extends Struct.ComponentSchema {
  collectionName: 'components_common_questions';
  info: {
    description: '';
    displayName: 'Questions';
  };
  attributes: {
    Answer: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactCertifiedExcellence extends Struct.ComponentSchema {
  collectionName: 'components_contact_certified_excellences';
  info: {
    displayName: 'Certified Excellence';
  };
  attributes: {
    Content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Image_Section: Schema.Attribute.Component<'contact.image-section', true>;
    Title: Schema.Attribute.String;
  };
}

export interface ContactImageSection extends Struct.ComponentSchema {
  collectionName: 'components_contact_image_sections';
  info: {
    displayName: 'Image Section';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface ContactModalForm extends Struct.ComponentSchema {
  collectionName: 'components_contact_modal_forms';
  info: {
    description: '';
    displayName: 'Modal Form';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
  };
}

export interface HomeBannerSection extends Struct.ComponentSchema {
  collectionName: 'components_home_banner_sections';
  info: {
    displayName: 'Banner Section';
  };
  attributes: {
    Cover_Image: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
  };
}

export interface HomeBuyAndSellSection extends Struct.ComponentSchema {
  collectionName: 'components_home_buy_and_sell_sections';
  info: {
    displayName: 'Buy And Sell Section';
  };
  attributes: {
    Button: Schema.Attribute.Component<'button.button', false>;
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
  };
}

export interface HomeCarJourney extends Struct.ComponentSchema {
  collectionName: 'components_home_car_journeys';
  info: {
    displayName: 'Car Journey';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Journey: Schema.Attribute.Component<'home.journey-list', true>;
    Title: Schema.Attribute.String;
  };
}

export interface HomeJourneyList extends Struct.ComponentSchema {
  collectionName: 'components_home_journey_lists';
  info: {
    displayName: 'Journey List';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Image: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
  };
}

export interface InsightsFeatures extends Struct.ComponentSchema {
  collectionName: 'components_insights_features';
  info: {
    displayName: 'Features';
  };
  attributes: {
    Content: Schema.Attribute.String;
    Count: Schema.Attribute.String;
    Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface MenuFooter extends Struct.ComponentSchema {
  collectionName: 'components_menu_footers';
  info: {
    description: '';
    displayName: 'Footer';
  };
  attributes: {
    Page: Schema.Attribute.Component<'menu.page', true>;
  };
}

export interface MenuHeader extends Struct.ComponentSchema {
  collectionName: 'components_menu_headers';
  info: {
    displayName: 'Header';
  };
  attributes: {
    Label: Schema.Attribute.String & Schema.Attribute.Required;
    Link: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface MenuLinks extends Struct.ComponentSchema {
  collectionName: 'components_menu_links';
  info: {
    displayName: 'Links';
  };
  attributes: {
    Label: Schema.Attribute.String;
    URL: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface MenuLocation extends Struct.ComponentSchema {
  collectionName: 'components_menu_locations';
  info: {
    displayName: 'Location';
  };
  attributes: {
    Label: Schema.Attribute.String;
    URL: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
  };
}

export interface MenuPage extends Struct.ComponentSchema {
  collectionName: 'components_menu_pages';
  info: {
    description: '';
    displayName: 'Page';
  };
  attributes: {
    Links: Schema.Attribute.Component<'menu.links', true>;
    Type: Schema.Attribute.String;
  };
}

export interface OfferExclusiveDealsSection extends Struct.ComponentSchema {
  collectionName: 'components_offer_exclusive_deals_sections';
  info: {
    displayName: 'Exclusive Deals Section';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface OfferOfferSection extends Struct.ComponentSchema {
  collectionName: 'components_offer_offer_sections';
  info: {
    displayName: 'Offer Section';
  };
  attributes: {
    Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface OtherVideos extends Struct.ComponentSchema {
  collectionName: 'components_other_videos';
  info: {
    displayName: 'Videos';
  };
  attributes: {};
}

export interface PricePrice extends Struct.ComponentSchema {
  collectionName: 'components_price_prices';
  info: {
    description: '';
    displayName: 'Price';
  };
  attributes: {
    Maximum: Schema.Attribute.BigInteger;
    Minimum: Schema.Attribute.BigInteger;
  };
}

export interface SeoGoogleTagManager extends Struct.ComponentSchema {
  collectionName: 'components_seo_google_tag_managers';
  info: {
    description: '';
    displayName: 'Google Tag Manager';
  };
  attributes: {
    Body: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Head: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Other: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
  };
}

export interface SettingsContact extends Struct.ComponentSchema {
  collectionName: 'components_settings_contacts';
  info: {
    displayName: 'Contact';
  };
  attributes: {
    Address1: Schema.Attribute.Text & Schema.Attribute.Required;
    Address2: Schema.Attribute.Text;
    Email: Schema.Attribute.Email & Schema.Attribute.Required;
    Google_Map_Embed_Code: Schema.Attribute.String;
    Google_Map_URL: Schema.Attribute.String;
    Phone_Number: Schema.Attribute.String & Schema.Attribute.Required;
    WhatsApp_Number: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SettingsSmtp extends Struct.ComponentSchema {
  collectionName: 'components_settings_smtps';
  info: {
    description: '';
    displayName: 'SMTP';
  };
  attributes: {
    From_Mail_Address: Schema.Attribute.Email & Schema.Attribute.Required;
    From_Name: Schema.Attribute.String & Schema.Attribute.Required;
    Host: Schema.Attribute.String & Schema.Attribute.Required;
    Password: Schema.Attribute.Password;
    Port: Schema.Attribute.Integer & Schema.Attribute.Required;
    User: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SettingsSocialMediaLinks extends Struct.ComponentSchema {
  collectionName: 'components_settings_social_media_links';
  info: {
    displayName: 'Social Media Links';
  };
  attributes: {
    Facebook_URL: Schema.Attribute.String;
    Instagram_URL: Schema.Attribute.String;
    Linkedin_URL: Schema.Attribute.String;
    Twitter_URL: Schema.Attribute.String;
    Youtube_URL: Schema.Attribute.String;
  };
}

export interface SharedMetaSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_meta_socials';
  info: {
    description: '';
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    Description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
    Social_Network: Schema.Attribute.Enumeration<['Facebook', 'Twitter']> &
      Schema.Attribute.Required;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    CanonicalURL: Schema.Attribute.String;
    Keywords: Schema.Attribute.Text;
    Meta_Description: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    Meta_Image: Schema.Attribute.Media<'images' | 'files' | 'videos'> &
      Schema.Attribute.Required;
    Meta_Robots: Schema.Attribute.String;
    Meta_Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    Meta_Viewport: Schema.Attribute.String;
    OG_Description: Schema.Attribute.Text;
    OG_Title: Schema.Attribute.String;
    Structured_Data: Schema.Attribute.JSON;
  };
}

export interface WidgetBrandSection extends Struct.ComponentSchema {
  collectionName: 'components_widget_brand_sections';
  info: {
    displayName: 'Brand Section';
  };
  attributes: {
    brands: Schema.Attribute.Relation<'oneToMany', 'api::brand.brand'>;
    Button: Schema.Attribute.Component<'button.button', false>;
    Description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface WidgetCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_widget_call_to_actions';
  info: {
    displayName: 'Call To Action';
  };
  attributes: {
    Button: Schema.Attribute.Component<'button.button', true>;
    Content1: Schema.Attribute.String & Schema.Attribute.Required;
    Content2: Schema.Attribute.String;
    Cover_Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface WidgetInsights extends Struct.ComponentSchema {
  collectionName: 'components_widget_insights';
  info: {
    description: '';
    displayName: 'Insights';
  };
  attributes: {
    Button: Schema.Attribute.Component<'button.button', false>;
    Content: Schema.Attribute.Text;
    Features: Schema.Attribute.Component<'insights.features', true>;
    Heading: Schema.Attribute.String;
    Image: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface WidgetMoments extends Struct.ComponentSchema {
  collectionName: 'components_widget_moments';
  info: {
    description: '';
    displayName: 'Moments';
  };
  attributes: {
    Company_Name: Schema.Attribute.String & Schema.Attribute.Required;
    Content: Schema.Attribute.Text & Schema.Attribute.Required;
    Heading: Schema.Attribute.String & Schema.Attribute.Required;
    Shorts: Schema.Attribute.Component<'widget.shorts', true>;
  };
}

export interface WidgetShorts extends Struct.ComponentSchema {
  collectionName: 'components_widget_shorts';
  info: {
    description: '';
    displayName: 'Shorts';
  };
  attributes: {
    Instagram_Link: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/'>;
    Instagram_Shorts: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'button.button': ButtonButton;
      'car.find-more-section': CarFindMoreSection;
      'car.image': CarImage;
      'car.inspection-report-section': CarInspectionReportSection;
      'common.author': CommonAuthor;
      'common.benefit-section': CommonBenefitSection;
      'common.benefits-and-advantages-section': CommonBenefitsAndAdvantagesSection;
      'common.faq': CommonFaq;
      'common.points': CommonPoints;
      'common.questions': CommonQuestions;
      'contact.certified-excellence': ContactCertifiedExcellence;
      'contact.image-section': ContactImageSection;
      'contact.modal-form': ContactModalForm;
      'home.banner-section': HomeBannerSection;
      'home.buy-and-sell-section': HomeBuyAndSellSection;
      'home.car-journey': HomeCarJourney;
      'home.journey-list': HomeJourneyList;
      'insights.features': InsightsFeatures;
      'menu.footer': MenuFooter;
      'menu.header': MenuHeader;
      'menu.links': MenuLinks;
      'menu.location': MenuLocation;
      'menu.page': MenuPage;
      'offer.exclusive-deals-section': OfferExclusiveDealsSection;
      'offer.offer-section': OfferOfferSection;
      'other.videos': OtherVideos;
      'price.price': PricePrice;
      'seo.google-tag-manager': SeoGoogleTagManager;
      'settings.contact': SettingsContact;
      'settings.smtp': SettingsSmtp;
      'settings.social-media-links': SettingsSocialMediaLinks;
      'shared.meta-social': SharedMetaSocial;
      'shared.seo': SharedSeo;
      'widget.brand-section': WidgetBrandSection;
      'widget.call-to-action': WidgetCallToAction;
      'widget.insights': WidgetInsights;
      'widget.moments': WidgetMoments;
      'widget.shorts': WidgetShorts;
    }
  }
}
