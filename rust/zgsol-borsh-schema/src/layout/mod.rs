mod borsh_type;
mod field;
pub use borsh_type::BorshType;
pub use field::LayoutField;

#[derive(Debug)]
pub enum Kind {
    Enum,
    Struct,
}

#[derive(Debug)]
pub struct Layout {
    pub name: String,
    pub kind: Kind,
    pub fields: Vec<LayoutField>,
}

impl Layout {
    pub fn from_tokens(
        name: &str,
        fields: &mut dyn Iterator<Item = &syn::Field>,
    ) -> Result<Self, anyhow::Error> {
        let fields = fields
            .map(LayoutField::from_tokens)
            .collect::<Result<Vec<_>, _>>()?;
        Ok(Self {
            name: name.to_string(),
            kind: Kind::Struct,
            fields,
        })
    }

    pub fn to_ts_class(&self) -> String {
        let class_fields = self
            .fields
            .iter()
            .map(|field| String::from("\n\t") + &field.to_class_field() + ";")
            .collect::<String>();
        format!(
            r#"export class {} extends {:?} {{{}
}};

"#,
            self.name, self.kind, class_fields,
        )
    }

    pub fn to_borsh_schema(&self) -> String {
        let first_line = match self.kind {
            Kind::Struct => "kind: 'struct', fields:",
            Kind::Enum => "kind: 'enum', field: 'enum', values:",
        };
        let borsh_schema_fields = self
            .fields
            .iter()
            .map(|field| String::from("\n\t\t\t") + &field.to_borsh_schema() + ",")
            .collect::<String>();
        // NOTE don't change this string (tabs are included in the output string)
        format!(
            r#"
    [
            {},
            {{
                {} [{}
                ],
            }},
    ],"#,
            self.name, first_line, borsh_schema_fields,
        )
    }
}
