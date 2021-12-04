use quote::quote;
use syn::DeriveInput;

#[proc_macro_derive(BorshSchema, attributes(alias))]
pub fn borsh_schema(input: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let input = syn::parse_macro_input!(input as DeriveInput);
    let name = input.ident;
    let (impl_generics, ty_generics, where_clause) = input.generics.split_for_impl();

    let token_stream2 = quote! {
        impl #impl_generics BorshSchema for #name #ty_generics #where_clause {}
    };
    token_stream2.into()
}
