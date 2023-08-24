import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Button, Table, Modal, message, Upload ,Tooltip} from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
// import axios from 'axios';
import Header from '@/components/Header';
import useMyWallet from '@/hooks/useMyWallet';
// import useWeb3 from '@/hooks/useWeb3';
// import useAppState from '@/hooks/useAppState';
import {useApi,useToken} from '@/hooks/useAppState';
import { formatBytes, utc2beijing } from '@/utils/index';
import { shortenFileName } from '@/utils/index';
// import { toSpecialAmount } from '@/utils/amount';
import { useTranslation } from 'react-i18next';
// import providerNode from '@/api/provider';
import './index.scss';

// eslint-disable-next-line react/no-multi-comp
const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const {memoToken}= useToken();
  const API = useApi();
  // const tableData: {
  //   current: 1,
  //   pageSize: 10,
  //   total:0
  // }
  const columns: Array<any> = [
    {
      title: `${t('Home.Document')}`,
      dataIndex: 'Name',
      render: Name => `${decodeURIComponent(Name)}`,
      align: 'center'
    },

    {
      title: `${t('Home.Size_of_File')}`,
      dataIndex: 'Size',
      render: Size => `${formatBytes(Size, 2)}`,
      align: 'center'
    },
    {
      title: `${t('Home.File_Upload')}`,
      dataIndex: 'ModTime',
      render: ModTime => `${utc2beijing(ModTime)}`,
      align: 'center',
      sorter:(a , b) =>{
        const aTime = new Date(a.ModTime).getTime();
        const bTime = new Date(b.ModTime).getTime();
        return aTime - bTime;
      },
      defaultSortOrder: 'descend'
    },
    {
      title: `${t('Home.CID')}`,
      dataIndex: 'Cid',
      render: Cid => `${Cid}`,
      align: 'center'
    },
    {
      title: `${t('Home.File_Download')}`,
      Name: 'operation',
      fixed: 'right',
      width: 200,
      render: (record) =>(
        <Button type="primary"
          shape="default"
          icon={<DownloadOutlined />}
          onClick={() => download(record.Name)}
        >
          {t('Home.Download')}
        </Button>
      ),
      align: 'center'
    }
  ];
  // const navigate = useNavigate();
  // const web3 = useWeb3();
  const {account, status} = useMyWallet();
  const [isUpload, isSetUpload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [fileSize, setFileSize] = useState(0);
  useEffect(() => {
    if (memoToken && status === 'connected') {
      getDataList();
      isSetUpload(false);
    } else {
      setDataList([]);
      isSetUpload(true);
    }
  }, [memoToken,status,account]);

  // 获取文件列表
  const getDataList = ()=>{
    API.get('mefs/listobjects')
    .then(function (res){
      if (res && res.status == 200) {
            setDataList(res.data.Object);
        } else {
          setDataList([]);
        }
    });
  };

  const handleUpload = async() => {
    const reader = new FileReader();
    fileList.forEach(file => {
      reader.readAsArrayBuffer(file.originFileObj);
      reader.onload = async() => {
        let formData = new FormData();
        formData.append('file', file.originFileObj);
        await API({
          method: 'POST',
          url:'/mefs/',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          data:formData
        }).then(function (res) {
          if(res.status == 200){
            setUploading(false);
            setFileList([]);
            getDataList();
            message.success(`${t('Home.upload_successfully')}`);
            setIsModalOpen(false);
          }else{
            message.error(`${t('Home.upload_failed')}`);
            setUploading(false);
          }
        })
        .catch(function (error) {

          message.error(`upload failed.${error}`);
          setUploading(false);
        });
      };
    });
    setUploading(true);
  };

  // 下载方法
  const download = (items)=>{
    const link = document.createElement('a');
    link.href = `${process.env.REACT_APP_URL}mefs/${items.Cid}`;
    link.click();
  };


  const handleChange: UploadProps['onChange'] = (info) => {
    let newFileList = [...info.fileList];
    newFileList = newFileList.slice(-2);
    setFileList(newFileList);
    setFileSize(newFileList[0] ? newFileList[0].size : 0);
  };

  const props: UploadProps = {
    onChange: handleChange,
    onRemove: file => {
      setUploading(false);
      setFileSize(0);
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);

  };

  // 取消弹窗
  const handleCancel = () => {
    setIsModalOpen(false);
    setUploading(false);
    setFileList([]);
    setFileSize(0);
  };

  return (
    <>
      <div className="HomePage">
        <Header />
        <div className="container">
          <div className="Home">
            <div className="Home_button">
              <Button
                type="primary"
                shape="default"
                icon={<UploadOutlined />}
                size="large"
                disabled={isUpload}
                onClick={showModal}
              >
                {t('Upload')}
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={dataList}
              locale={{ emptyText: `${t('Home.No_Data')}` }}
              rowKey={(record) => record.Cid}

            />
          </div>
        </div>

        <Modal title={t('Home.Upload_Files')}
          open={isModalOpen}
          onOk={handleOk}
          footer={[
            <Button key="back"
              onClick={handleCancel}
              disabled={uploading == true}
            >
            {t('Home.Close')}
          </Button>
          ]}
        >
          <Upload {...props}
            maxCount={1}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}
              disabled={uploading == true}
            >{t('Home.Select_the_File')}</Button>
          </Upload>
          <div className="item-fileInfo"
            style={{display: (fileList.length !== 0 ? 'block' : 'none')}}
          >
            <p>{t('Home.Size_of_upload')}{formatBytes(fileSize, 2)}</p>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? 'Uploading' : `${t('Home.Start_upload')}`}
          </Button>
        </Modal>
        <div className="Mobile_terminal">
          {dataList != undefined && dataList.length != 0 ?
            <ul className="container">
              {dataList.map((item: any) => {
                return (
                  <li className="Mobile"
                    key={(item.Cid) ? (item.Cid).replace(/"/g, '') : ''}
                  >
                    <div className="Mobile_file">
                      <p >{t('Home.Document')}</p>
                      <p>
                        <Tooltip
                          placement="topLeft"
                          title={decodeURIComponent(item.Name)}
                        >
                          {shortenFileName(decodeURIComponent(item.Name))}
                        </Tooltip>
                      </p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.Size_of_File')}</p>
                      <p>{formatBytes(item.Size, 2)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>{t('Home.File_Upload')}</p>
                      <p>{utc2beijing(item.ModTime)}</p>
                    </div>
                    <div className="Mobile_file">
                      <p>Cid</p>
                      <p>{(item.Cid) ? (item.Cid).replace(/"/g, '') : ''}</p>
                    </div>
                    <div className="Mobile_file">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => download(item.Name)}
                      >
                        {t('Home.Download')}
                      </Button>
                    </div>
                  </li>
                );
              },

              )}
            </ul>
            :
            <div className="Mobile_termina">
              {isUpload ?
                <div className="container" >
                  <span className="iconfont icon-weikong"/>
                  <p>{t('Home.No_data')}</p>
                </div>
                :
                <div className="container" >
                    <div className="container" >
                      <span className="iconfont icon-weikong"/>
                      <p>{t('Home.No_data')}</p>
                    </div>
                </div>
              }
            </div>
          }
          <div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
