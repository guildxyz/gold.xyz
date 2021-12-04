pub use zgsol_borsh_schema_derive::*;

#[cfg(feature = "full")]
mod layout;
#[cfg(all(test, feature = "full"))]
mod test;
#[cfg(feature = "full")]
mod utils;

#[cfg(feature = "full")]
pub use utils::*;

pub trait BorshSchema {}
