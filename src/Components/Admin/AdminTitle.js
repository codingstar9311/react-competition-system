import React from "react";

const AdminTitle = (props) => {
    return (
        <div className={'row py-2'}>
            <div className='col-12'>
                <h2>{props.title}</h2>
            </div>
        </div>
    )
};

export default AdminTitle
