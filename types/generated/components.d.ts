import type { Schema, Struct } from '@strapi/strapi';

export interface ButtonButton extends Struct.ComponentSchema {
  collectionName: 'components_button_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    Label: Schema.Attribute.String & Schema.Attribute.Required;
    URL: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'#'>;
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

export interface CommonFaq extends Struct.ComponentSchema {
  collectionName: 'components_common_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    Questions: Schema.Attribute.Component<'common.questions', true>;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Frequently Asked Questions'>;
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

export interface OtherVideos extends Struct.ComponentSchema {
  collectionName: 'components_other_videos';
  info: {
    displayName: 'Videos';
  };
  attributes: {};
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

export interface SeoSeo extends Struct.ComponentSchema {
  collectionName: 'components_seo_seos';
  info: {
    displayName: 'SEO';
    icon: 'globe';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Keywords: Schema.Attribute.Text;
    OG_Image: Schema.Attribute.Media<'images' | 'files'>;
    Title: Schema.Attribute.String;
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
    displayName: 'Moments';
  };
  attributes: {
    Company_Name: Schema.Attribute.String & Schema.Attribute.Required;
    Content: Schema.Attribute.Text & Schema.Attribute.Required;
    Heading: Schema.Attribute.String & Schema.Attribute.Required;
    Instagram_Shorts: Schema.Attribute.Media<'files' | 'videos', true> &
      Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'button.button': ButtonButton;
      'car.image': CarImage;
      'common.author': CommonAuthor;
      'common.faq': CommonFaq;
      'common.questions': CommonQuestions;
      'insights.features': InsightsFeatures;
      'menu.header': MenuHeader;
      'other.videos': OtherVideos;
      'seo.google-tag-manager': SeoGoogleTagManager;
      'seo.seo': SeoSeo;
      'settings.contact': SettingsContact;
      'settings.smtp': SettingsSmtp;
      'settings.social-media-links': SettingsSocialMediaLinks;
      'widget.brand-section': WidgetBrandSection;
      'widget.call-to-action': WidgetCallToAction;
      'widget.insights': WidgetInsights;
      'widget.moments': WidgetMoments;
    }
  }
}
