// app/services/metaobjects.actions.server.js

// 🔹 1. publish
export async function publishMetaobject(admin, id) {
  const mutation = `
    mutation UpdateMetaobject($id: ID!) {
      metaobjectUpdate(
        id: $id
        metaobject: {
          capabilities: {
            publishable: {
              status: ACTIVE
            }
          }
        }
      ) {
        metaobject { id }
        userErrors { message }
      }
    }
  `;

  const res = await admin.graphql(mutation, {
    variables: { id },
  });

  const json = await res.json();

  const errors = json.data.metaobjectUpdate.userErrors;

  if (errors.length > 0) {
    return {
      success: false,
      message: errors[0].message,
    };
  }

  return { success: true };
}

// 🔹 2. create (USES publish)
export async function createMetaobject(admin, { type, fields, successMessage }) {
  try {
    const mutation = `
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject { id }
          userErrors { message }
        }
      }
    `;

    const response = await admin.graphql(mutation, {
      variables: {
        metaobject: { type, fields },
      },
    });

    const json = await response.json();

    const errors = json.data.metaobjectCreate.userErrors;
    if (errors.length > 0) {
      return {
        success: false,
        message: errors[0].message,
      };
    }

    const id = json.data.metaobjectCreate.metaobject.id;

    // 🔥 HERE is where publishMetaobject is used
    const publishResult = await publishMetaobject(admin, id);

    if (!publishResult.success) {
      return publishResult;
    }

    return {
      success: true,
      message: successMessage,
    };

  } catch (e) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

// 🔹 3. delete
export async function deleteMetaobject(admin, id) {
  try {
    const mutation = `
      mutation DeleteMetaobject($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors { message }
        }
      }
    `;

    const res = await admin.graphql(mutation, {
      variables: { id },
    });

    const json = await res.json();

    const errors = json.data.metaobjectDelete.userErrors;

    if (errors.length > 0) {
      return {
        success: false,
        message: errors[0].message,
      };
    }

    return {
      success: true,
      message: "Deleted successfully",
    };

  } catch (e) {
    return {
      success: false,
      message: "Delete failed",
    };
  }
}