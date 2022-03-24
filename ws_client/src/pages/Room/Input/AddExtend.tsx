

function AddExtend() {

    return (
        <div className="add-extend">
            {
                new Array(50).fill(0).map((_, i) => (
                    <div className="add-extend-item" key={i}>
                        <div className="add-extend-item-img">

                        </div>
                        <p className="add-extend-item-title">相册</p>
                    </div>
                ))
            }
        </div>
    )
}

export default AddExtend
