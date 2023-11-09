import { useState } from 'react'
import deleteIcon from '../../images/delete.png'

function PagesSidebar() {
  const [pages, setPages] = useState([{id: 1},{id: 2}])
  const [selectedPage, setSelectedPage] = useState({id: 1})
  const [addPageModalIsOpen, setAddPageModalIsOpen] = useState(false)

  return (
    <>
      <div className={'add-page-modal ' + (addPageModalIsOpen ? 'add-page-modal-open':'add-page-modal-closed')}>
        <div class="add-page-modal-content">
          <span class="close" onClick={() => setAddPageModalIsOpen(false)}>&times;</span>
          <div className='container-col add-page-form'>
            <label for="pname">Page name</label>
            <input type="text" id="pname" name="pname" />
            <button className='add-page-btn'>Add Page</button>
          </div>

        </div>
      </div>
      <div className="container-col sidebar-container">
        <button className='add-page-btn' onClick={() => setAddPageModalIsOpen(true)}>Add Page</button>
        {pages.map(page => {
          return (
            <div className={'container-row ' + (selectedPage.id === page.id ? 'page-container-selected' : 'page-container')}>
              {page.id}
              <img className='delete-icon' src={deleteIcon} alt="Delete icon" />
            </div>
          )
        })}
      </div>
    </>
  );
}

export default PagesSidebar;
