import React, { PropTypes } from 'react'

//ProductList是有一个title和有一个children，其中children是一个ProTypes.node属性
const ProductsList = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

ProductsList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
}

export default ProductsList
