'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import deleteIcon from '../../images/delete.png'

function PagesSidebar({editor}) {
  const [pages, setPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [addPageModalIsOpen, setAddPageModalIsOpen] = useState(false)
  const [name, setName] = useState("");

  useEffect(()=>{
    if (!editor){
      return
    }
    
    const data = {
      id: 'page-1',
      name: 'Home Page',
      component: '<div id="comp1">Start Editing</div>',
      styles: '#comp1 { color: red }',
    }
    const pm = editor.Pages;

    if (pm.getAll().length === 0) {
      pm.add(data);
    }

    setPages(pm.getAll())
    setSelectedPage(pm.getAll()[0])
  }, [editor])

  if (!editor){
    return
  }
  const pm = editor.Pages;

  

  const addPage = () => {
    pm.add({
        name: `${name}`,
        component: `<div>New ${name} page</div>`,
      });
    setPages(pm.getAll())
    setName("")
  }
  
  const deletePage = (pageId) => {
    pm.remove(pageId);
    setPages(pm.getAll())
    setSelectedPage(pm.getSelected())
  }
  const setPage = (pageId) => {
    pm.select(pageId);   
    setSelectedPage(pm.getSelected()) 
  }

  return (
    <>
      <div className={'add-page-modal ' + (addPageModalIsOpen ? 'add-page-modal-open':'add-page-modal-closed')}>
        <div className="add-page-modal-content">
          <span className="close" onClick={() => setAddPageModalIsOpen(false)}>&times;</span>
          <div className='container-col add-page-form'>
            <label>Page name</label>
            <input type="text" id="pname" name="pname" value={name} onChange={(e)=>setName(e.target.value)}/>
            <button className='add-page-btn' onClick={addPage}>Add Page</button>
          </div>

        </div>
      </div>
      <div className="container-col sidebar-container">
        <button className='add-page-btn' onClick={() => setAddPageModalIsOpen(true)}>Add Page</button>
        {pages.map((page, i) => {
          return (
            <div
              key={i}
              className={
                "container-row " +
                (selectedPage && selectedPage.getId() === page.getId()
                  ? "page-container-selected"
                  : "page-container")
              }
              onClick={() => {
                setSelectedPage(page)
                setPage(page.id)
              }}
            >
              {page.getName()}
              {(selectedPage && selectedPage.getId() === page.getId()
                  ? <></>
                  : <Image className="delete-icon" src={deleteIcon} alt="Delete icon" onClick={()=>deletePage(page.id)} height={20}/>)}
              
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PagesSidebar;
