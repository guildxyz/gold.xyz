extern crate proc_macro;

use proc_macro::TokenStream;
use proc_macro2::TokenStream as TokenStream2;
use quote::{quote, ToTokens};
use syn::{Attribute, Data, DeriveInput, Fields, Type};

use std::collections::VecDeque;
use std::str::FromStr;

#[proc_macro_derive(MaxSerializedLen, attributes(len))]
pub fn impl_max_serialized_len(input: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let len = match input.data {
        Data::Struct(ref data) => fields_len(&data.fields),
        Data::Enum(ref data) => {
            let mut max_lengths = data
                .variants
                .iter()
                .map(|variant| {
                    if let Some(len) = find_len_attr(&variant.attrs) {
                        len
                    } else {
                        fields_len(&variant.fields)
                    }
                })
                .collect::<VecDeque<TokenStream2>>();
            let mut max_len = max_lengths.pop_front().unwrap();
            for len in max_lengths.into_iter() {
                max_len = recourse_max_len(max_len, len);
            }
            quote! { 1 + #max_len }
        }
        Data::Union(_) => unimplemented!(),
    };
    let token_stream2 = quote! {
        impl MaxSerializedLen for #name {
            const MAX_SERIALIZED_LEN: usize = #len;
        }
    };
    token_stream2.into()
}

fn recourse_max_len(a: TokenStream2, b: TokenStream2) -> TokenStream2 {
    quote! { [#a, #b][((#a) < (#b)) as usize] }
}

fn fields_len(fields: &Fields) -> TokenStream2 {
    match fields {
        Fields::Named(ref fields) => recourse_fields(&mut fields.named.iter()),
        Fields::Unnamed(ref fields) => recourse_fields(&mut fields.unnamed.iter()),
        Fields::Unit => quote! { 0 },
    }
}

fn recourse_fields(fields: &mut dyn Iterator<Item = &syn::Field>) -> TokenStream2 {
    let recourse = fields.map(|f| {
        if let Some(len) = find_len_attr(&f.attrs) {
            len
        } else {
            match f.ty {
                Type::Path(ref type_path) => {
                    if let Some(ty) = type_path.path.get_ident() {
                        quote! { #ty::MAX_SERIALIZED_LEN }
                    } else {
                        let stream = type_path.to_token_stream();
                        let mut stream_vec = stream
                            .into_iter()
                            .map(|token| token.to_string())
                            .collect::<Vec<String>>();
                        stream_vec.insert(1, "::".to_string());
                        stream_vec.push("::MAX_SERIALIZED_LEN".to_string());
                        let stream_string = stream_vec.into_iter().collect::<String>();
                        let stream = TokenStream2::from_str(&stream_string).unwrap();
                        quote! { #stream }
                    }
                }
                _ => unimplemented!(),
            }
        }
    });
    quote! { 0 #( + #recourse)* }
}

fn find_len_attr(attrs: &[Attribute]) -> Option<TokenStream2> {
    attrs
        .iter()
        .find(|attr| attr.path.is_ident("len"))
        .map(|len| {
            let length = len.parse_args::<TokenStream2>().unwrap();
            quote! { #length }
        })
}

#[proc_macro_derive(AccountState)]
pub fn impl_account_state(input: TokenStream) -> TokenStream {
    let input = syn::parse_macro_input!(input as DeriveInput);
    let name = input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    let token_stream2 = quote! {
        impl #impl_generics AccountState for #name #ty_generics #where_clause {}
    };
    token_stream2.into()
}
