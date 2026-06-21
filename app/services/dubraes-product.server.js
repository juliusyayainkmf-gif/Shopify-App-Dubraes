const PRODUCT_TITLE = "Custom Dubraes";
const PRODUCT_DESCRIPTION = `
  <p>Custom Small or Medium Premium Dubraes</p>
  <p>Sold by the set (2 pcs)</p>
  <p>Size 1.25 or 1.5 Inches</p>
  <p>Material Finish - Plating / Spraying / Powder Coated</p>
  <p>Material - Metal</p>
`;
const VARIANT_WITHOUT_CUSTOMIZATION = "Dubraes Only";
const VARIANT_WITH_CUSTOMIZATION = "Dubraes with Custom Design";

const toNumericId = (gid) => gid?.split("/").pop() || "";

const graphql = async (admin, query, variables = {}) => {
  const response = await admin.graphql(query, { variables });
  const json = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }

  return json.data;
};

const getProductVariants = (product) =>
  product?.variants?.nodes?.map((variant) => ({
    id: variant.id,
    numericId: toNumericId(variant.id),
    title: variant.title,
    option: variant.selectedOptions?.[0]?.value || variant.title,
  })) || [];

const findCustomDubraesProduct = async (admin) => {
  const data = await graphql(
    admin,
    `#graphql
      query FindCustomDubraesProduct($query: String!) {
        products(first: 1, query: $query) {
          nodes {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `,
    { query: `title:'${PRODUCT_TITLE}'` },
  );

  return data.products.nodes[0] || null;
};

const createCustomDubraesProduct = async (admin) => {
  const data = await graphql(
    admin,
    `#graphql
      mutation CreateCustomDubraesProduct($input: ProductSetInput!) {
        productSet(input: $input, synchronous: true) {
          product {
            id
            title
            handle
            variants(first: 10) {
              nodes {
                id
                title
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      input: {
        title: PRODUCT_TITLE,
        descriptionHtml: PRODUCT_DESCRIPTION,
        vendor: "KEEP ME FRESH",
        status: "ACTIVE",
        productOptions: [
          {
            name: "Type",
            position: 1,
            values: [
              { name: VARIANT_WITHOUT_CUSTOMIZATION },
              { name: VARIANT_WITH_CUSTOMIZATION },
            ],
          },
        ],
        variants: [
          {
            price: "5.00",
            optionValues: [
              {
                optionName: "Type",
                name: VARIANT_WITHOUT_CUSTOMIZATION,
              },
            ],
          },
          {
            price: "5.00",
            optionValues: [
              {
                optionName: "Type",
                name: VARIANT_WITH_CUSTOMIZATION,
              },
            ],
          },
        ],
      },
    },
  );

  const errors = data.productSet.userErrors;
  if (errors.length) {
    throw new Error(errors.map((error) => error.message).join(", "));
  }

  return data.productSet.product;
};

export const ensureCustomDubraesProduct = async (admin) => {
  const existingProduct = await findCustomDubraesProduct(admin);
  const product = existingProduct || (await createCustomDubraesProduct(admin));
  const variants = getProductVariants(product);

  const withoutCustomization = variants.find(
    (variant) => variant.option === VARIANT_WITHOUT_CUSTOMIZATION,
  );
  const withCustomization = variants.find(
    (variant) => variant.option === VARIANT_WITH_CUSTOMIZATION,
  );

  if (!withoutCustomization || !withCustomization) {
    throw new Error(
      `The "${PRODUCT_TITLE}" product exists, but it does not have both required variants.`,
    );
  }

  return {
    created: !existingProduct,
    product: {
      id: product.id,
      numericId: toNumericId(product.id),
      title: product.title,
      handle: product.handle,
    },
    variants: {
      withoutCustomization,
      withCustomization,
    },
  };
};
