use super::BorshType;
use heck::MixedCase;
use proc_macro2::TokenStream;
use quote::ToTokens;

use std::str::FromStr;

#[derive(Debug)]
pub struct LayoutField {
    name: String,
    ty: BorshType,
}

impl LayoutField {
    pub fn from_tokens(field: &syn::Field) -> Result<Self, anyhow::Error> {
        let name = if let Some(field_name) = field.ident.as_ref() {
            field_name.to_string().to_mixed_case()
        } else {
            "unnamed".to_owned()
        };
        let ty = if let Some(alias) = field.attrs.iter().find(|attr| attr.path.is_ident("alias")) {
            BorshType::from_str(&alias.parse_args::<TokenStream>()?.to_string())?
        } else {
            BorshType::from_str(&field.ty.to_token_stream().to_string())?
        };
        Ok(Self { name, ty })
    }

    pub fn from_enum_variant(name_str: &str) -> Result<Self, anyhow::Error> {
        let ty = BorshType::from_str(name_str)?;
        Ok(Self {
            name: name_str.to_mixed_case(),
            ty,
        })
    }

    pub fn to_class_field(&self) -> String {
        format!("{}: {}", self.name, self.ty.to_class_type())
    }

    pub fn to_borsh_schema(&self) -> String {
        format!("['{}', {}]", self.name, self.ty.to_borsh_schema())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use proc_macro2::{Span, TokenStream};
    use syn::token::Colon;
    use syn::{Ident, Type, Visibility};

    #[test]
    fn simple_field_construction() {
        let syn_field = syn::Field {
            attrs: Vec::new(),
            vis: Visibility::Inherited,
            ident: Some(Ident::new("random_field", Span::call_site())),
            colon_token: Some(Colon {
                spans: [Span::call_site(); 1],
            }),
            ty: Type::Verbatim(TokenStream::from_str("u8").unwrap()),
        };

        let field = LayoutField::from_tokens(&syn_field).unwrap();

        assert_eq!(field.name, "randomField");
        assert_eq!(field.ty, BorshType::U8);
    }

    #[test]
    fn complex_field_construction() {
        let syn_field = syn::Field {
            attrs: Vec::new(),
            vis: Visibility::Inherited,
            ident: Some(Ident::new("optional_accounts", Span::call_site())),
            colon_token: Some(Colon {
                spans: [Span::call_site(); 1],
            }),
            ty: syn::parse_str("[Option<Pubkey>; 3]").unwrap(),
        };

        let field = LayoutField::from_tokens(&syn_field).unwrap();

        assert_eq!(field.name, "optionalAccounts");
        assert_eq!(
            field.ty,
            BorshType::FixedArray(Box::new(BorshType::Option(Box::new(BorshType::Pubkey))), 3)
        );
    }

    #[test]
    fn simple_field_to_borsh_schema() {
        let field = LayoutField {
            name: "someRandomString".to_owned(),
            ty: BorshType::String,
        };

        assert_eq!(field.to_borsh_schema(), "['someRandomString', 'string']");

        let field = LayoutField {
            name: "myCustomType".to_owned(),
            ty: BorshType::Custom("aCustomType".to_owned()),
        };

        assert_eq!(field.to_borsh_schema(), "['myCustomType', aCustomType]");
    }

    #[test]
    fn field_to_ts_class_field() {
        let field = LayoutField {
            name: "fieldAlpha".to_owned(),
            ty: BorshType::U64,
        };
        assert_eq!(field.to_class_field(), "fieldAlpha: BN");
        let field = LayoutField {
            name: "fieldBeta".to_owned(),
            ty: BorshType::Vec(Box::new(BorshType::String)),
        };
        assert_eq!(field.to_class_field(), "fieldBeta: string[]");
        let field = LayoutField {
            name: "fieldGamma".to_owned(),
            ty: BorshType::Option(Box::new(BorshType::FixedBytes(32))),
        };
        assert_eq!(field.to_class_field(), "fieldGamma: [32] | null");
    }
}
